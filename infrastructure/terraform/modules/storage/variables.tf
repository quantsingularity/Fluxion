variable "environment" {
  description = "Environment name"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ARN for S3 encryption"
  type        = string
}

variable "enable_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "enable_mfa_delete" {
  description = "Enable MFA delete for versioned objects"
  type        = bool
  default     = false
}

variable "lifecycle_rules" {
  description = "S3 lifecycle rules"
  type = list(object({
    id              = string
    status          = string
    expiration_days = number
  }))
  default = []
}

variable "backup_retention_days" {
  description = "Days to retain non-current object versions"
  type        = number
  default     = 90
}

variable "enable_access_logging" {
  description = "Enable S3 access logging"
  type        = bool
  default     = false
}

variable "common_tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
