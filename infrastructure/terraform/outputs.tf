output "deployments_bucket_name" {
  description = "Name of the S3 bucket storing deployments"
  value       = aws_s3_bucket.deployments.id
}

output "deployments_bucket_arn" {
  description = "ARN of the S3 bucket storing deployments"
  value       = aws_s3_bucket.deployments.arn
}

output "uploads_bucket_name" {
  description = "Name of the S3 bucket for uploads"
  value       = aws_s3_bucket.uploads.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.deployments.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.deployments.domain_name
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.deployments.arn
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].zone_id : null
}

output "route53_name_servers" {
  description = "Route53 name servers (update these in your domain registrar)"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].name_servers : null
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
}

output "platform_api_access_key_id" {
  description = "Access key ID for platform API user"
  value       = aws_iam_access_key.platform_api.id
  sensitive   = false
}

output "platform_api_secret_access_key" {
  description = "Secret access key for platform API user"
  value       = aws_iam_access_key.platform_api.secret
  sensitive   = true
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for deployments"
  value       = var.use_dynamodb ? aws_dynamodb_table.deployments[0].name : null
}

output "deployment_url_pattern" {
  description = "URL pattern for deployments"
  value       = var.domain_name != "" ? "https://{subdomain}.${var.domain_name}" : "https://${aws_cloudfront_distribution.deployments.domain_name}/{path}"
}

output "setup_instructions" {
  description = "Next steps after Terraform apply"
  value       = <<-EOT

    ✅ Infrastructure deployed successfully!

    📋 Next Steps:

    1. Update your domain registrar with these nameservers:
       ${var.domain_name != "" ? join("\n       ", aws_route53_zone.main[0].name_servers) : "N/A - Using CloudFront domain"}

    2. Save these AWS credentials (keep them secure!):
       AWS_ACCESS_KEY_ID: ${aws_iam_access_key.platform_api.id}
       AWS_SECRET_ACCESS_KEY: ${aws_iam_access_key.platform_api.secret}

    3. Update your .env.local file with:
       AWS_REGION=${var.aws_region}
       AWS_ACCESS_KEY_ID=${aws_iam_access_key.platform_api.id}
       AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.platform_api.secret}
       S3_DEPLOYMENTS_BUCKET=${aws_s3_bucket.deployments.id}
       S3_UPLOADS_BUCKET=${aws_s3_bucket.uploads.id}
       CLOUDFRONT_DISTRIBUTION_ID=${aws_cloudfront_distribution.deployments.id}
       ${var.domain_name != "" ? "DOMAIN_NAME=${var.domain_name}" : ""}
       ${var.use_dynamodb ? "DYNAMODB_TABLE=${aws_dynamodb_table.deployments[0].name}" : ""}

    4. Your deployment URLs will be:
       ${var.domain_name != "" ? "https://{project-name}.${var.domain_name}" : "https://${aws_cloudfront_distribution.deployments.domain_name}/{project-name}/"}

    🚀 Ready to deploy!
  EOT
}
