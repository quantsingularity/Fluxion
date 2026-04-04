resource "aws_security_group" "app" {
  name        = "${var.app_name}-${var.environment}-app-sg"
  description = "Security group for ${var.app_name} application in ${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(var.common_tags, {
    Name        = "${var.app_name}-${var.environment}-app-sg"
    Environment = var.environment
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "db" {
  name        = "${var.app_name}-${var.environment}-db-sg"
  description = "Security group for ${var.app_name} database in ${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
    description     = "MySQL from application tier only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(var.common_tags, {
    Name        = "${var.app_name}-${var.environment}-db-sg"
    Environment = var.environment
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "bastion" {
  name        = "${var.app_name}-${var.environment}-bastion-sg"
  description = "Security group for bastion host - SSH access restricted to known CIDRs"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
    description = "SSH from allowed CIDRs only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = merge(var.common_tags, {
    Name        = "${var.app_name}-${var.environment}-bastion-sg"
    Environment = var.environment
  })

  lifecycle {
    create_before_destroy = true
  }
}
