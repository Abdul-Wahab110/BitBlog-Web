import { Database } from '../config/database';

export class RoleModel {
  public static async findAll() {
    return Database.execute(`SELECT * FROM roles ORDER BY role_id ASC`);
  }

  public static async findByName(roleName: string) {
    return Database.execute(`SELECT * FROM roles WHERE role_name = :1`, [roleName]);
  }
}
