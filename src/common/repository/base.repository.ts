import mongoose, { AnyKeys, CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, QueryWithHelpers, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from "mongoose";
import th from "zod/v4/locales/th.js";
import { IPaginate } from "../interface";


export abstract class DatabaseRepository<TRawDocType> {
  constructor(protected model: Model<TRawDocType>) {
  }

  //CREATE
  async create({ data }: { data: AnyKeys<TRawDocType> }): Promise<HydratedDocument<TRawDocType>>
  async create({ data, options }: { data: AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType>[]>

  async create({ data, options }: { data: AnyKeys<TRawDocType> | AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType> | HydratedDocument<TRawDocType>[]> {
    return await this.model.create(data as any, options)
  }

  async createOne({ data, options = {} }: { data: AnyKeys<TRawDocType>; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType>> {
    const [doc] = await this.create({ data: [data], options });
    return doc as HydratedDocument<TRawDocType>
  }


  //FINDERS

  //findOne

  async findOne({
    filter,
    projection,
    options,

  }: {
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType> | null | undefined,
    options?: QueryOptions<TRawDocType> & { lean?: false } | null | undefined
  }): Promise<HydratedDocument<TRawDocType> | undefined | null>


  async findOne({
    filter,
    projection,
    options,

  }: {
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType> | null | undefined,
    options?: QueryOptions<TRawDocType> & { lean?: true } | null | undefined
  }): Promise<FlattenMaps<TRawDocType> | undefined | null>


  async findOne({
    filter = {},
    projection,
    options,

  }: {
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType> | null | undefined,
    options?: QueryOptions<TRawDocType> & { lean?: boolean } | null | undefined
  }): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null> {

    const doc = this.model.findOne(filter, projection)

    if (options?.select) {
      doc.select(options.select);
    }
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) {
      doc.lean(options.lean);
    }
    return await doc.exec();


  }


  // findById

  async findById({
    id,
    projection,
    options,

  }: {
    id: mongoose.Types.ObjectId,
    projection?: ProjectionType<TRawDocType> | null | undefined,
    options?: QueryOptions<TRawDocType> & { lean?: false } | null | undefined
  }): Promise<HydratedDocument<TRawDocType> | undefined | null>


  async findById({
    id,
    projection,
    options,

  }: {
    id: mongoose.Types.ObjectId,
    projection?: ProjectionType<TRawDocType> | null | undefined,
    options?: QueryOptions<TRawDocType> & { lean?: true } | null | undefined
  }): Promise<FlattenMaps<TRawDocType> | undefined | null>


  async findById({
    id,
    projection,
    options,

  }: {
    id: mongoose.Types.ObjectId,
    projection?: ProjectionType<TRawDocType> | null | undefined,
    options?: QueryOptions<TRawDocType> & { lean?: boolean } | null | undefined
  }): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null> {

    const doc = this.model.findById(id, projection)

    if (options?.select) {
      doc.select(options.select);
    }
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) {
      doc.lean(options.lean);
    }
    return await doc.exec();


  }

  //find
  

  async find({
    filter = {},
    projection,
    options ={},
  }: {
    filter?: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType> | null | undefined,
    options?: QueryOptions<TRawDocType>  | null,
  } = {}):Promise<HydratedDocument<TRawDocType>[]> {

    const doc = this.model.find(filter)
    if (options?.select) {
      doc.select(options.select);
    }
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.skip) {
      doc.skip(options.skip);
    }

    if (options?.limit) {
      doc.limit(options.limit);
    }

    if (options?.lean) {
      doc.lean(options.lean);
    }

    if (options?.sort) {
      doc.sort(options.sort);
    }
    return await doc.exec();
  }


  async countDocuments ({
   filter = {}
  }:{
  filter: QueryFilter<TRawDocType>
  }):Promise<number> {
    return await this.model.countDocuments(filter)
  }

//paginate 

async paginate({
  filter = {},
  options = {},
  page = 1,
  limit = 5,
}: {
  filter?: QueryFilter<TRawDocType>;
  projection?: ProjectionType<TRawDocType> | null | undefined;
  options?: QueryOptions<TRawDocType>;
  page: number;
  limit: number;
}):Promise<IPaginate<HydratedDocument<TRawDocType>>> {
  const skip = (page - 1) * limit;

  const count = await this.countDocuments({ filter });

  const pages = Math.ceil(count / limit);

  const docs = await this.find({
    filter,
    options:{
      skip,
      limit,
      ...options
    }
  })

  return { count, limit, pages, currentPage: page, docs };
}


// UPDATE

async updateOne(
{
filter ={},
update,
options
}:{
  filter: QueryFilter<TRawDocType>,
  update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
  options?: MongooseUpdateQueryOptions<TRawDocType> | null
}):Promise<UpdateWriteOpResult>{
  return await this.model.updateOne(filter , update , options)
 
}


async updateMany(
{
filter ={},
update,
options
}:{
  filter: QueryFilter<TRawDocType>,
  update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
  options?: MongooseUpdateQueryOptions<TRawDocType> | null
}):Promise<UpdateWriteOpResult>{
  return await this.model.updateMany(filter , update , options)
 
}

async findOneAndUpdate(
{
filter ={},
update,
options
}:{
  filter?: QueryFilter<TRawDocType>,
  update?: UpdateQuery<TRawDocType>,
  options?: QueryOptions<TRawDocType> | null
}):Promise<HydratedDocument<TRawDocType> | null>{

  return await this.model.findOneAndUpdate(filter , update , {returnDocument:'after' , ...options})
 
}


async findByIdAndUpdate(
{
id,
update,
options
}:{
  id: mongoose.Types.ObjectId,  update?: UpdateQuery<TRawDocType>,
  options?: QueryOptions<TRawDocType> | null
}):Promise<HydratedDocument<TRawDocType> | null>{

  return await this.model.findByIdAndUpdate(id , update , {returnDocument:'after' , ...options})
 
}



// DELETE

async deleteOne(
{
filter ={}
}:{
  filter: QueryFilter<TRawDocType>

}):Promise<DeleteResult>{
  return await this.model.deleteOne(filter)
 
}


async deleteMany(
{
filter ={}
}:{
  filter: QueryFilter<TRawDocType>
}):Promise<DeleteResult>{
  return await this.model.deleteMany(filter)
 
}

async findOneAndDelete(
{
filter ={}
}:{
  filter?: QueryFilter<TRawDocType>,
}):Promise<HydratedDocument<TRawDocType> | null>{

  return await this.model.findOneAndDelete(filter)
 
}


async findByIdAndDelete(
{
id
}:{
  id: mongoose.Types.ObjectId,  update?: UpdateQuery<TRawDocType>,
}):Promise<HydratedDocument<TRawDocType> | null>{

  return await this.model.findByIdAndDelete(id)
 
}

}

