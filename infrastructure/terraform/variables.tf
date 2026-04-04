# Fluxion Infrastructure Variables - Enhanced for Financial Security

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "fluxion"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "default_tags" {
  description = "Default tags to apply to all resources"
  type        = map(string)
  default = {
    Project    = "Fluxion"
    Owner      = "DevOps"
    CostCenter = "Engineering"
    Compliance = "Financial"
  }
}

variable "assume_role_arn" {
  description = "ARN of the role to assume for cross-account access"
  type        = string
  default     = null
}

variable "assume_role_external_id" {
  description = "External ID for assume role"
  type        = string
  default     = null
  sensitive   = true
}

variable "kms_deletion_window" {
  description = "KMS key deletion window in days"
  type        = number
  default     = 30
  validation {
    condition     = var.kms_deletion_window >= 7 && var.kms_deletion_window <= 30
    error_message = "KMS deletion window must be between 7 and 30 days."
  }
}

variable "enable_multi_region" {
  description = "Enable multi-region KMS key"
  type        = bool
  default     = false
}

# Network
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT gateway"
  type        = bool
  default     = true
}

variable "enable_vpn_gateway" {
  description = "Enable VPN gateway"
  type        = bool
  default     = false
}

variable "enable_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = true
}

# Compute
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = null
}

variable "asg_min_size" {
  description = "Minimum ASG size"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "Maximum ASG size"
  type        = number
  default     = 5
}

variable "asg_desired_capacity" {
  description = "Desired ASG capacity"
  type        = number
  default     = 2
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed EC2 monitoring"
  type        = bool
  default     = true
}

variable "enable_alb" {
  description = "Enable Application Load Balancer"
  type        = bool
  default     = true
}

variable "alb_certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = null
}

variable "health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/health"
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "fluxiondb"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "fluxion_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Initial RDS storage in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum RDS storage in GB"
  type        = number
  default     = 100
}

variable "db_backup_retention_period" {
  description = "RDS backup retention in days"
  type        = number
  default     = 7
}

variable "db_backup_window" {
  description = "RDS backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "RDS maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "db_multi_az" {
  description = "Enable RDS Multi-AZ"
  type        = bool
  default     = false
}

variable "db_deletion_protection" {
  description = "Enable RDS deletion protection"
  type        = bool
  default     = true
}

variable "db_skip_final_snapshot" {
  description = "Skip final RDS snapshot"
  type        = bool
  default     = false
}

variable "db_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = false
}

variable "db_monitoring_interval" {
  description = "RDS enhanced monitoring interval (0 to disable)"
  type        = number
  default     = 0
}

# Security
variable "enable_guardduty" {
  description = "Enable GuardDuty"
  type        = bool
  default     = true
}

variable "enable_config" {
  description = "Enable AWS Config"
  type        = bool
  default     = true
}

variable "enable_cloudtrail" {
  description = "Enable CloudTrail"
  type        = bool
  default     = true
}

variable "enable_security_hub" {
  description = "Enable Security Hub"
  type        = bool
  default     = false
}

variable "enable_inspector" {
  description = "Enable Inspector"
  type        = bool
  default     = false
}

variable "cloudtrail_s3_bucket" {
  description = "S3 bucket for CloudTrail"
  type        = string
  default     = null
}

variable "config_s3_bucket" {
  description = "S3 bucket for AWS Config"
  type        = string
  default     = null
}

# Storage
variable "enable_s3_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "enable_s3_mfa_delete" {
  description = "Enable S3 MFA delete"
  type        = bool
  default     = false
}

variable "s3_lifecycle_rules" {
  description = "S3 lifecycle rules"
  type = list(object({
    id              = string
    status          = string
    expiration_days = number
  }))
  default = []
}

variable "backup_retention_days" {
  description = "Backup retention days"
  type        = number
  default     = 90
}
