import mysql from 'mysql2/promise';
import { MYSQL } from '../constants.js';

const access = {
  user: MYSQL.USER,
  password: MYSQL.PASSWORD,
  host: MYSQL.host,
}

const mysqlConnectionPool = mysql.createPool(access);
export default mysqlConnectionPool;
