resource "aws_secretsmanager_secret" "medusa_secrets" {
  name        = "${var.project_name}-env-secrets-${random_id.suffix.hex}"
  description = "Secrets for Medusa Marketplace"
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_secretsmanager_secret_version" "medusa_secrets" {
  secret_id = aws_secretsmanager_secret.medusa_secrets.id
  secret_string = jsonencode({
    JWT_SECRET    = var.jwt_secret
    COOKIE_SECRET = var.cookie_secret
    DATABASE_URL  = "postgres://${aws_db_instance.default.username}:${var.db_password}@${aws_db_instance.default.endpoint}/${aws_db_instance.default.db_name}"
    REDIS_URL     = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:6379"
  })
}

resource "aws_iam_policy" "ecs_secrets_access" {
  name        = "${var.project_name}-secrets-access"
  description = "Allow ECS tasks to read secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.medusa_secrets.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_secrets_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_access.arn
}
