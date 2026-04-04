variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ARN"
  type        = string
  default     = null
}

variable "enable_guardduty" {
  description = "Enable AWS GuardDuty"
  type        = bool
  default     = true
}

variable "enable_config" {
  description = "Enable AWS Config"
  type        = bool
  default     = true
}

variable "enable_cloudtrail" {
  description = "Enable AWS CloudTrail"
  type        = bool
  default     = true
}

variable "enable_security_hub" {
  description = "Enable AWS Security Hub"
  type        = bool
  default     = false
}

variable "enable_inspector" {
  description = "Enable AWS Inspector"
  type        = bool
  default     = false
}

variable "cloudtrail_s3_bucket" {
  description = "S3 bucket for CloudTrail logs"
  type        = string
  default     = null
}

variable "config_s3_bucket" {
  description = "S3 bucket for AWS Config"
  type        = string
  default     = null
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed for SSH access to bastion"
  type        = list(string)
  default     = []
}

variable "common_tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
