export class StatusCode {
  static OK = 200;
  static CREATED = 201;
  static NO_CONTENT = 204;
  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static FORBIDDEN = 403;
  static NOT_FOUND = 404;
  static INTERNAL_SERVER_ERROR = 500;
}
export class ErrorMessages {
  static INVALID_INPUT = "Invalid input provided.";
  static UNAUTHORIZED_ACCESS = "Unauthorized access.";
  static RESOURCE_NOT_FOUND = "Requested resource not found.";
  static INTERNAL_SERVER_ERROR = "An internal server error occurred.";
  static FORBIDDEN_ACCESS = "Access to this resource is forbidden.";
}
export class SuccessMessages {
  static RESOURCE_CREATED = "Resource created successfully.";
  static RESOURCE_UPDATED = "Resource updated successfully.";
  static RESOURCE_DELETED = "Resource deleted successfully.";
  static OPERATION_SUCCESSFUL = "Operation completed successfully.";
  static DATA_FETCHED = "Data fetched successfully.";
}
export class JWT{
  static ALG = 'HS256';
  static SECRET = new TextEncoder().encode("secret");
}

export class MYSQL {
  static USER = "root";
  static PASSWORD = "meimeielin";
  static DATABASE = "dbms-112306010";
}
