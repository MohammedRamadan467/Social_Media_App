import { HydratedDocument, Model } from "mongoose";
import { ApplicationException, BadRequestException, ConflictException, NotFoundException, TooManyRequestsException } from "../../common/exception";
import { ConfirmEmailDto, LoginDto, RequestForgotPasswordDto, ResendConfirmEmailDto, resetForgotPassword, SignupDto, VeriryForgotPasswordDto } from "./dto/authentication.dto";
import { IUser } from "../../common/interface";
import { UserRepository } from "../../common/repository";
import { compare, createLoginCredentials, encryption, hash, userBaseRevokeTokenKey } from "../../common/security";
import { cacheService, CacheService } from "../../common/service";
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum";
import { emailEvent, userEmailKey, userEmaiTrialsKey } from "../../common/utlis/email";
import { createOtp } from "../../common/utlis/otp";
import { OAuth2Client } from "google-auth-library";
import { WEB_CLIENT_IDS } from "../../config";

class AuthenticationService {
    private userRepository: UserRepository
    private cacheService: CacheService
    constructor() {
        this.cacheService = cacheService
        this.userRepository = new UserRepository()
    }








    
private client = new OAuth2Client();
async verifyGoogleAccount(idToken:string) {
  const ticket = await this.client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_IDS
  });

  const payload = ticket.getPayload();
  if(!payload!.email_verified) throw new BadRequestException("email not verified")
  return payload!
}




async signupWithGmail (idToken:string , issuer:string){

const {name , email , picture} = await this.verifyGoogleAccount(idToken)

const existAccount = await this.userRepository.findOne({
    filter:{email:email!}
})

if (existAccount) {
    if (existAccount.provider != ProviderEnum.GOOGLE) {
        throw new ConflictException("Invalid account provider")
    }
   
    return {status:201  , data: await createLoginCredentials({user:existAccount , issuer})}
}
 const user = await this.userRepository.createOne({
    data:{
        username:name,
        email,
        confirmEmail:new Date(),
        provider:ProviderEnum.GOOGLE,
        image:picture
    }
 })
return  {status:200  , data:await createLoginCredentials({user , issuer})}

}



    async sendEmailOtp({
        email,
        subject,
        title,
        expiresIn = 120,
        maxTrials = 3,
        blockInSeconds = 300
    }: {
        email: string,
        subject: EmailSubjectEnum,
        title?: string,
        expiresIn?: number,
        maxTrials?: number,
        blockInSeconds?: number
    }) {

        const existOTP_TTL = await this.cacheService.ttl({ key: userEmailKey({ email, subject }) })
        if (existOTP_TTL > 0) {
            throw new ConflictException(`sorry we connot create new otp while existing one still valid please try again later after ${existOTP_TTL}`)
        }

        const oldTrials = await this.cacheService.get({ key: userEmaiTrialsKey({ email, subject }) }) ?? 0;

        if (oldTrials >= maxTrials) {
            throw new TooManyRequestsException("Max otp trials has been reached")
        }

        const code = createOtp()
        await this.cacheService.set({
            key: userEmailKey({ email, subject }),
            value: await hash(code.toString()),
            ttl: expiresIn
        })

        const currentTrials = await this.cacheService.incrBy({ key: userEmaiTrialsKey({ email, subject }) })
        if (currentTrials == 3) {
            await this.cacheService.expire({ key: userEmaiTrialsKey({ email, subject }), ttl: blockInSeconds })
        }

        emailEvent.emit("send-Email",
            {
                recipients: { to: email },
                subject,
                data: { code, title: title ?? subject }
            })

    }




    async signup({ email, password, username, phone }: SignupDto['body']): Promise<IUser> {
        const duplicatedAccount = await this.userRepository.findOne({
            filter: { email },
            options: { select: "email" }
        })

        if (duplicatedAccount) throw new ConflictException("Email exists")

        const account = await this.userRepository.createOne({
            data: {
                email,
                password: await hash(password),
                phone: await encryption(phone),
                username
            }
        })

        await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
        return account
    }





    async resendConfirmEmail({ email }: ResendConfirmEmailDto): Promise<void> {

        const account = await this.userRepository.findOne({
            filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
            options: { select: "email" }
        })

        if (!account) throw new NotFoundException("Invalid acccount")

        await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
        return

    }



    async confirmEmail({ email, otp }: ConfirmEmailDto): Promise<void> {

        const account = await this.userRepository.findOne({
            filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
            options: { select: "email" }
        })

        if (!account) throw new NotFoundException("Invalid acccount")

        const hashOtp = await this.cacheService.get({ key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })

        if (!hashOtp || !(await compare(otp, hashOtp))) {

            throw new ConflictException("Invalid OTP")
        }

        account.confirmEmail = new Date() as unknown as string;
        await account.save()

        await this.cacheService.del({ key: await this.cacheService.keys({ prefix: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) }) })

        return

    }


    async login({ email, password }: LoginDto, issuer: string) {


        const account = await this.userRepository.findOne({
            filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } }
        })
        if (!account) throw new NotFoundException("not Exist")
        const matchPassword = await compare(password, account.password)

        if (!matchPassword) throw new NotFoundException("Invalid password")

        if (account.twoStepVerification) {

            await this.sendEmailOtp({ email, subject: EmailSubjectEnum.LOGIN })
            throw new BadRequestException("Two step verification required")
        }

        return await createLoginCredentials({ user: account, issuer })

    }



    async requestForgotPasswordCode({ email }: RequestForgotPasswordDto) {

        const account = await this.userRepository.findOne({
            filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
            options: { select: "email" }
        })

        if (!account) throw new NotFoundException("Invalid acccount")

        await this.sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD })
        return;

    }



    async verifyForgotPasswordCode ({email , otp}:VeriryForgotPasswordDto){

    const account = await this.userRepository.findOne({
         filter:{email , provider:ProviderEnum.SYSTEM , confirmEmail: {$exists:true}} ,
          options:{select:"email"}
        })

    if(!account) throw new NotFoundException("Invalid acccount")

    const hashOtp = await this.cacheService.get({key : userEmailKey({email , subject: EmailSubjectEnum.FORGOT_PASSWORD})})

    if(!hashOtp || !(await compare(otp , hashOtp))){

         throw new ConflictException("Invalid OTP")
    }

    return account

    }




    async resetForgotPassword ({email , otp , password }:resetForgotPassword){

    const account = await this.verifyForgotPasswordCode({email , otp})
    account.password = await hash(password)
    account.changeCredentialsTime = new Date() as unknown as string;
    await account.save()

    const result = await Promise.all([
         this.cacheService.keys({prefix : userEmailKey({email , subject: EmailSubjectEnum.FORGOT_PASSWORD})}),
         this.cacheService.keys({prefix: userBaseRevokeTokenKey({userId:account._id})})
    ])

    await this.cacheService.del({
        key: [...result[0] , ...result[1]]
    })

}

     

















}

export default new AuthenticationService()