variable "aws_region" {
  description = "AWS Region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  default     = "medusa-marketplace"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Medusa JWT Secret"
  type        = string
  sensitive   = true
}

variable "cookie_secret" {
  description = "Medusa Cookie Secret"
  type        = string
  sensitive   = true
}
