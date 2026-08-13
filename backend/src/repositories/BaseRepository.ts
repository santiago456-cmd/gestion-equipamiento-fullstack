import {Model, ModelStatic, FindOptions, CountOptions, CreationAttributes, Attributes} from "sequelize"

export class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findAll(options: FindOptions<Attributes<T>> = {}): Promise<T[]> {
    return this.model.findAll(options);
  }

  async findById(id: number): Promise<T | null> {
    return this.model.findByPk(id);
  }

  async create(data: CreationAttributes<T>): Promise<T> {
    return this.model.create(data);
  }

  async updateInstance(instance: T, data: Partial<Attributes<T>>): Promise<T> {
    return instance.update(data);
  }

  async deleteInstance(instance: T): Promise<boolean> {
    await instance.destroy();
    return true;
  }

  async count(options: CountOptions<Attributes<T>> = {}): Promise<number> {
    return this.model.count(options);
  }
}
