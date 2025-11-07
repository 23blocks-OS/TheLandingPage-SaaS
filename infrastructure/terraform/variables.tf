variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "23blocks-deploy"
}

variable "domain_name" {
  description = "Domain name for deployments (e.g., 23blocks.net). Leave empty to use CloudFront domain."
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront distribution price class"
  type        = string
  default     = "PriceClass_100" # Use PriceClass_All for global, PriceClass_100 for US/Europe
}

variable "use_dynamodb" {
  description = "Use DynamoDB for deployment tracking instead of PostgreSQL"
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Enable AWS WAF for CloudFront distribution"
  type        = bool
  default     = false
}

variable "max_upload_size_mb" {
  description = "Maximum upload size in MB"
  type        = number
  default     = 100
}

variable "deployment_retention_days" {
  description = "Number of days to retain old deployments"
  type        = number
  default     = 90
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
