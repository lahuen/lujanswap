output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_storefront_url" {
  value = aws_ecr_repository.storefront.repository_url
}

output "db_endpoint" {
  value = aws_db_instance.default.endpoint
}
