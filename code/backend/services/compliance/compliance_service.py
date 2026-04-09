"""
Compliance service for Fluxion backend
"""

import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, Dict, List
from uuid import UUID

from models.compliance import (
    AMLCheck,
    AMLRiskLevel,
    ComplianceAlert,
    ComplianceAlertStatus,
    ComplianceAlertType,
    KYCRecord,
    KYCStatus,
)
from models.transaction import Transaction, TransactionStatus
from models.user import User
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class ComplianceService:
    """Comprehensive compliance service"""

    def __init__(self) -> None:
        self.transaction_threshold_usd = Decimal("10000")
        self.daily_threshold_usd = Decimal("50000")
        self.suspicious_velocity_threshold = 10
        self.high_risk_countries = ["AF", "IR", "KP", "SY"]

    async def check_transaction_compliance(
        self, db: AsyncSession, transaction: Transaction, user: User
    ) -> Dict[str, Any]:
        """Comprehensive transaction compliance check"""
        try:
            compliance_result = {
                "compliant": True,
                "risk_score": 0.0,
                "alerts": [],
                "recommendations": [],
            }
            if (
                transaction.usd_value
                and transaction.usd_value >= self.transaction_threshold_usd
            ):
                compliance_result["risk_score"] += 20
                compliance_result["alerts"].append(
                    {
                        "type": "high_value_transaction",
                        "message": f"Transaction exceeds ${self.transaction_threshold_usd} threshold",
                    }
                )
            daily_volume = await self._get_user_daily_volume(db, user.id)
            if daily_volume >= self.daily_threshold_usd:
                compliance_result["risk_score"] += 30
                compliance_result["alerts"].append(
                    {
                        "type": "daily_threshold_breach",
                        "message": f"Daily transaction volume exceeds ${self.daily_threshold_usd}",
                    }
                )
            hourly_count = await self._get_user_hourly_transaction_count(db, user.id)
            if hourly_count >= self.suspicious_velocity_threshold:
                compliance_result["risk_score"] += 25
                compliance_result["alerts"].append(
                    {
                        "type": "suspicious_velocity",
                        "message": f"High transaction velocity: {hourly_count} transactions in last hour",
                    }
                )
            user_risk = await self._assess_user_risk(db, user)
            compliance_result["risk_score"] += user_risk["score"]
            if user_risk["alerts"]:
                compliance_result["alerts"].extend(user_risk["alerts"])
            kyc_check = await self._check_kyc_compliance(db, user)
            if not kyc_check["compliant"]:
                compliance_result["compliant"] = False
                compliance_result["risk_score"] += 50
                compliance_result["alerts"].extend(kyc_check["alerts"])
            sanctions_check = await self._check_sanctions(db, user, transaction)
            compliance_result["risk_score"] += sanctions_check["score"]
            if sanctions_check["alerts"]:
                compliance_result["alerts"].extend(sanctions_check["alerts"])
            if compliance_result["risk_score"] >= 70:
                compliance_result["compliant"] = False
                compliance_result["recommendations"].append(
                    "Transaction requires manual review"
                )
            elif compliance_result["risk_score"] >= 50:
                compliance_result["recommendations"].append(
                    "Enhanced monitoring required"
                )
            if (
                not compliance_result["compliant"]
                or compliance_result["risk_score"] >= 50
            ):
                await self._create_compliance_alert(
                    db, user.id, transaction.id, compliance_result
                )
            logger.info(
                f"Compliance check completed for transaction {transaction.id}: Score {compliance_result['risk_score']}, Compliant: {compliance_result['compliant']}"
            )
            return compliance_result
        except Exception as e:
            logger.error(
                f"Compliance check failed for transaction {transaction.id}: {str(e)}"
            )
            raise

    async def monitor_user_activity(
        self, db: AsyncSession, user_id: UUID, activity_window_hours: int = 24
    ) -> Dict[str, Any]:
        """Monitor user activity for suspicious patterns"""
        try:
            monitoring_result = {
                "risk_score": 0.0,
                "patterns": [],
                "recommendations": [],
            }
            cutoff_time = datetime.now(timezone.utc) - timedelta(
                hours=activity_window_hours
            )
            result = await db.execute(
                select(Transaction)
                .where(
                    and_(
                        Transaction.user_id == user_id,
                        Transaction.created_at >= cutoff_time,
                        Transaction.status == TransactionStatus.CONFIRMED,
                    )
                )
                .order_by(Transaction.created_at.desc())
            )
            transactions = result.scalars().all()
            if not transactions:
                return monitoring_result
            patterns = await self._analyze_transaction_patterns(transactions)
            monitoring_result["patterns"] = patterns
            for pattern in patterns:
                monitoring_result["risk_score"] += pattern.get("risk_score", 0)
            round_number_count = sum(
                (1 for tx in transactions if tx.amount and float(tx.amount) % 1000 == 0)
            )
            if round_number_count > len(transactions) * 0.5:
                monitoring_result["risk_score"] += 15
                monitoring_result["patterns"].append(
                    {
                        "type": "round_number_bias",
                        "description": "High frequency of round number transactions",
                        "risk_score": 15,
                    }
                )
            structuring_count = sum(
                (
                    1
                    for tx in transactions
                    if tx.usd_value and 9000 <= tx.usd_value <= 9999
                )
            )
            if structuring_count >= 3:
                monitoring_result["risk_score"] += 40
                monitoring_result["patterns"].append(
                    {
                        "type": "potential_structuring",
                        "description": "Multiple transactions just below $10,000 threshold",
                        "risk_score": 40,
                    }
                )
            if monitoring_result["risk_score"] >= 50:
                monitoring_result["recommendations"].append(
                    "Enhanced due diligence required"
                )
            if monitoring_result["risk_score"] >= 30:
                monitoring_result["recommendations"].append(
                    "Increased monitoring frequency"
                )
            return monitoring_result
        except Exception as e:
            logger.error(
                f"User activity monitoring failed for user {user_id}: {str(e)}"
            )
            raise

    async def generate_compliance_report(
        self,
        db: AsyncSession,
        start_date: datetime,
        end_date: datetime,
        report_type: str = "monthly",
    ) -> Dict[str, Any]:
        """Generate compliance report"""
        try:
            report = {
                "period": {"start": start_date, "end": end_date, "type": report_type},
                "summary": {},
                "metrics": {},
                "alerts": {},
                "recommendations": [],
            }
            tx_result = await db.execute(
                select(
                    func.count(Transaction.id).label("total_transactions"),
                    func.sum(Transaction.usd_value).label("total_volume"),
                    func.count(Transaction.id)
                    .filter(Transaction.usd_value >= self.transaction_threshold_usd)
                    .label("high_value_transactions"),
                ).where(
                    and_(
                        Transaction.created_at >= start_date,
                        Transaction.created_at <= end_date,
                        Transaction.status == TransactionStatus.CONFIRMED,
                    )
                )
            )
            tx_metrics = tx_result.first()
            report["metrics"]["transactions"] = {
                "total_count": tx_metrics.total_transactions or 0,
                "total_volume_usd": float(tx_metrics.total_volume or 0),
                "high_value_count": tx_metrics.high_value_transactions or 0,
            }
            kyc_result = await db.execute(
                select(
                    func.count(KYCRecord.id).label("total_kyc"),
                    func.count(KYCRecord.id)
                    .filter(KYCRecord.status == KYCStatus.APPROVED)
                    .label("approved_kyc"),
                    func.count(KYCRecord.id)
                    .filter(KYCRecord.status == KYCStatus.REJECTED)
                    .label("rejected_kyc"),
                ).where(
                    and_(
                        KYCRecord.created_at >= start_date,
                        KYCRecord.created_at <= end_date,
                    )
                )
            )
            kyc_metrics = kyc_result.first()
            report["metrics"]["kyc"] = {
                "total_submissions": kyc_metrics.total_kyc or 0,
                "approved_count": kyc_metrics.approved_kyc or 0,
                "rejected_count": kyc_metrics.rejected_kyc or 0,
                "approval_rate": (kyc_metrics.approved_kyc or 0)
                / max(kyc_metrics.total_kyc or 1, 1)
                * 100,
            }
            aml_result = await db.execute(
                select(
                    func.count(AMLCheck.id).label("total_checks"),
                    func.count(AMLCheck.id)
                    .filter(AMLCheck.risk_level == AMLRiskLevel.HIGH)
                    .label("high_risk_checks"),
                    func.count(AMLCheck.id)
                    .filter(or_(AMLCheck.sanctions_match, AMLCheck.pep_match))
                    .label("matches_found"),
                ).where(
                    and_(
                        AMLCheck.created_at >= start_date,
                        AMLCheck.created_at <= end_date,
                    )
                )
            )
            aml_metrics = aml_result.first()
            report["metrics"]["aml"] = {
                "total_checks": aml_metrics.total_checks or 0,
                "high_risk_count": aml_metrics.high_risk_checks or 0,
                "matches_count": aml_metrics.matches_found or 0,
            }
            alert_result = await db.execute(
                select(
                    func.count(ComplianceAlert.id).label("total_alerts"),
                    func.count(ComplianceAlert.id)
                    .filter(ComplianceAlert.status == ComplianceAlertStatus.OPEN)
                    .label("open_alerts"),
                    func.count(ComplianceAlert.id)
                    .filter(ComplianceAlert.status == ComplianceAlertStatus.RESOLVED)
                    .label("resolved_alerts"),
                ).where(
                    and_(
                        ComplianceAlert.created_at >= start_date,
                        ComplianceAlert.created_at <= end_date,
                    )
                )
            )
            alert_metrics = alert_result.first()
            report["alerts"] = {
                "total_count": alert_metrics.total_alerts or 0,
                "open_count": alert_metrics.open_alerts or 0,
                "resolved_count": alert_metrics.resolved_alerts or 0,
                "resolution_rate": (alert_metrics.resolved_alerts or 0)
                / max(alert_metrics.total_alerts or 1, 1)
                * 100,
            }
            report["summary"] = {
                "total_users_monitored": await self._count_active_users(
                    db, start_date, end_date
                ),
                "compliance_score": await self._calculate_compliance_score(
                    report["metrics"]
                ),
                "key_findings": await self._generate_key_findings(report["metrics"]),
            }
            report["recommendations"] = await self._generate_compliance_recommendations(
                report
            )
            logger.info(
                f"Compliance report generated for period {start_date} to {end_date}"
            )
            return report
        except Exception as e:
            logger.error(f"Compliance report generation failed: {str(e)}")
            raise

    async def _get_user_daily_volume(self, db: AsyncSession, user_id: UUID) -> Decimal:
        """Get user's daily transaction volume"""
        today = datetime.now(timezone.utc).date()
        result = await db.execute(
            select(func.sum(Transaction.usd_value)).where(
                and_(
                    Transaction.user_id == user_id,
                    func.date(Transaction.created_at) == today,
                    Transaction.status == TransactionStatus.CONFIRMED,
                )
            )
        )
        return result.scalar() or Decimal("0")

    async def _get_user_hourly_transaction_count(
        self, db: AsyncSession, user_id: UUID
    ) -> int:
        """Get user's transaction count in the last hour"""
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        result = await db.execute(
            select(func.count(Transaction.id)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.created_at >= one_hour_ago,
                    Transaction.status == TransactionStatus.CONFIRMED,
                )
            )
        )
        return result.scalar() or 0

    async def _assess_user_risk(self, db: AsyncSession, user: User) -> Dict[str, Any]:
        """Assess user risk factors"""
        risk_assessment = {"score": 0, "alerts": []}
        if user.country in self.high_risk_countries:
            risk_assessment["score"] += 30
            risk_assessment["alerts"].append(
                {
                    "type": "high_risk_jurisdiction",
                    "message": f"User from high-risk country: {user.country}",
                }
            )
        account_age = datetime.now(timezone.utc) - user.created_at
        if account_age.days < 30:
            risk_assessment["score"] += 15
            risk_assessment["alerts"].append(
                {
                    "type": "new_account",
                    "message": f"Account created {account_age.days} days ago",
                }
            )
        if user.kyc_status != KYCStatus.APPROVED:
            risk_assessment["score"] += 25
            risk_assessment["alerts"].append(
                {
                    "type": "kyc_incomplete",
                    "message": f"KYC status: {user.kyc_status.value}",
                }
            )
        return risk_assessment

    async def _check_kyc_compliance(
        self, db: AsyncSession, user: User
    ) -> Dict[str, Any]:
        """Check KYC compliance"""
        kyc_result = {"compliant": True, "alerts": []}
        if user.kyc_status != KYCStatus.APPROVED:
            kyc_result["compliant"] = False
            kyc_result["alerts"].append(
                {
                    "type": "kyc_required",
                    "message": "KYC verification required for this transaction",
                }
            )
        result = await db.execute(select(KYCRecord).where(KYCRecord.user_id == user.id))
        kyc_record = result.scalar_one_or_none()
        if kyc_record and kyc_record.is_expired():
            kyc_result["compliant"] = False
            kyc_result["alerts"].append(
                {"type": "kyc_expired", "message": "KYC verification has expired"}
            )
        return kyc_result

    async def _check_sanctions(
        self, db: AsyncSession, user: User, transaction: Transaction
    ) -> Dict[str, Any]:
        """Check sanctions and watchlists"""
        sanctions_result = {"score": 0, "alerts": []}
        result = await db.execute(
            select(AMLCheck)
            .where(AMLCheck.user_id == user.id)
            .order_by(AMLCheck.created_at.desc())
            .limit(1)
        )
        latest_aml = result.scalar_one_or_none()
        if latest_aml:
            if latest_aml.sanctions_match:
                sanctions_result["score"] += 100
                sanctions_result["alerts"].append(
                    {
                        "type": "sanctions_match",
                        "message": "User matches sanctions list",
                    }
                )
            if latest_aml.pep_match:
                sanctions_result["score"] += 50
                sanctions_result["alerts"].append(
                    {"type": "pep_match", "message": "User matches PEP list"}
                )
            if latest_aml.adverse_media:
                sanctions_result["score"] += 25
                sanctions_result["alerts"].append(
                    {"type": "adverse_media", "message": "Adverse media found for user"}
                )
        return sanctions_result

    async def _create_compliance_alert(
        self,
        db: AsyncSession,
        user_id: UUID,
        transaction_id: UUID,
        compliance_result: Dict[str, Any],
    ) -> None:
        """Create compliance alert"""
        alert_type = ComplianceAlertType.SUSPICIOUS_TRANSACTION
        severity = "high" if compliance_result["risk_score"] >= 70 else "medium"
        alert = ComplianceAlert(
            user_id=user_id,
            transaction_id=transaction_id,
            alert_type=alert_type,
            severity=severity,
            title="Transaction Compliance Alert",
            description=f"Transaction flagged with risk score {compliance_result['risk_score']}",
            details={
                "risk_score": compliance_result["risk_score"],
                "alerts": compliance_result["alerts"],
                "recommendations": compliance_result["recommendations"],
            },
            risk_score=compliance_result["risk_score"],
            triggered_at=datetime.now(timezone.utc),
        )
        db.add(alert)

    async def _analyze_transaction_patterns(
        self, transactions: List[Transaction]
    ) -> List[Dict[str, Any]]:
        """Analyze transaction patterns for suspicious activity"""
        patterns = []
        if len(transactions) < 2:
            return patterns
        time_diffs = []
        for i in range(1, len(transactions)):
            diff = (
                transactions[i - 1].created_at - transactions[i].created_at
            ).total_seconds() / 60
            time_diffs.append(diff)
        avg_time_diff = sum(time_diffs) / len(time_diffs)
        if avg_time_diff < 5:
            patterns.append(
                {
                    "type": "rapid_succession",
                    "description": f"Average time between transactions: {avg_time_diff:.1f} minutes",
                    "risk_score": 20,
                }
            )
        amounts = [float(tx.amount) for tx in transactions if tx.amount]
        if amounts:
            amount_variance = max(amounts) - min(amounts)
            if amount_variance < max(amounts) * 0.1:
                patterns.append(
                    {
                        "type": "similar_amounts",
                        "description": "Transactions have very similar amounts",
                        "risk_score": 15,
                    }
                )
        return patterns

    async def _count_active_users(
        self, db: AsyncSession, start_date: datetime, end_date: datetime
    ) -> int:
        """Count active users in period"""
        result = await db.execute(
            select(func.count(func.distinct(Transaction.user_id))).where(
                and_(
                    Transaction.created_at >= start_date,
                    Transaction.created_at <= end_date,
                )
            )
        )
        return result.scalar() or 0

    def _calculate_compliance_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall compliance score"""
        score = 100.0
        tx_metrics = metrics.get("transactions", {})
        total_tx = tx_metrics.get("total_count", 0)
        high_value_tx = tx_metrics.get("high_value_count", 0)
        if total_tx > 0:
            high_value_ratio = high_value_tx / total_tx
            if high_value_ratio > 0.1:
                score -= (high_value_ratio - 0.1) * 200
        kyc_metrics = metrics.get("kyc", {})
        approval_rate = kyc_metrics.get("approval_rate", 100)
        if approval_rate < 90:
            score -= (90 - approval_rate) * 0.5
        aml_metrics = metrics.get("aml", {})
        total_checks = aml_metrics.get("total_checks", 0)
        matches = aml_metrics.get("matches_count", 0)
        if total_checks > 0:
            match_ratio = matches / total_checks
            score -= match_ratio * 50
        return max(0, min(100, score))

    def _generate_key_findings(self, metrics: Dict[str, Any]) -> List[str]:
        """Generate key findings from metrics"""
        findings = []
        tx_metrics = metrics.get("transactions", {})
        if tx_metrics.get("high_value_count", 0) > 0:
            findings.append(
                f"{tx_metrics['high_value_count']} high-value transactions detected"
            )
        kyc_metrics = metrics.get("kyc", {})
        if kyc_metrics.get("approval_rate", 100) < 90:
            findings.append(
                f"KYC approval rate below 90%: {kyc_metrics['approval_rate']:.1f}%"
            )
        aml_metrics = metrics.get("aml", {})
        if aml_metrics.get("matches_count", 0) > 0:
            findings.append(f"{aml_metrics['matches_count']} AML matches found")
        return findings

    async def _generate_compliance_recommendations(
        self, report: Dict[str, Any]
    ) -> List[str]:
        """Generate compliance recommendations"""
        recommendations = []
        compliance_score = report["summary"].get("compliance_score", 100)
        if compliance_score < 80:
            recommendations.append("Enhance compliance monitoring and controls")
        alert_metrics = report.get("alerts", {})
        open_alerts = alert_metrics.get("open_count", 0)
        if open_alerts > 0:
            recommendations.append(
                f"Review and resolve {open_alerts} open compliance alerts"
            )
        resolution_rate = alert_metrics.get("resolution_rate", 100)
        if resolution_rate < 90:
            recommendations.append("Improve alert resolution processes")
        return recommendations

    async def monitor_transaction(
        self, db: AsyncSession, transaction_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Monitor a transaction for suspicious activity."""
        risk_score = 0.0
        flags: List[str] = []

        amount = float(transaction_data.get("amount", 0))
        if amount >= float(self.transaction_threshold_usd):
            risk_score += 0.3
            flags.append("high_value_transaction")

        frequency = transaction_data.get("frequency", 0)
        if frequency >= self.suspicious_velocity_threshold:
            risk_score += 0.25
            flags.append("high_frequency")

        country_risk = transaction_data.get("country_risk", 0.0)
        risk_score += country_risk * 0.3

        time_pattern = transaction_data.get("time_pattern", "normal")
        if time_pattern == "unusual":
            risk_score += 0.15
            flags.append("unusual_time_pattern")

        risk_score = min(1.0, risk_score)

        if risk_score >= 0.7:
            recommended_action = "block"
        elif risk_score >= 0.4:
            recommended_action = "review"
        else:
            recommended_action = "allow"

        return {
            "risk_score": risk_score,
            "flags": flags,
            "recommended_action": recommended_action,
            "transaction_id": transaction_data.get("user_id", "unknown"),
        }

    async def perform_aml_screening(
        self, db: AsyncSession, user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform AML screening on a user."""
        aml_risk_score = 0.0
        suspicious_indicators: List[str] = []

        country = user_data.get("country", "")
        if country in self.high_risk_countries:
            aml_risk_score += 0.4
            suspicious_indicators.append("high_risk_country")

        patterns = user_data.get("transaction_patterns", {})
        if patterns.get("large_cash_transactions", 0) >= 3:
            aml_risk_score += 0.3
            suspicious_indicators.append("large_cash_transactions")
        if patterns.get("rapid_movement", False):
            aml_risk_score += 0.2
            suspicious_indicators.append("rapid_fund_movement")
        if patterns.get("structuring_pattern", False):
            aml_risk_score += 0.35
            suspicious_indicators.append("structuring_pattern")

        aml_risk_score = min(1.0, aml_risk_score)

        if aml_risk_score >= 0.7:
            compliance_status = "high_risk"
        elif aml_risk_score >= 0.4:
            compliance_status = "medium_risk"
        else:
            compliance_status = "low_risk"

        return {
            "aml_risk_score": aml_risk_score,
            "suspicious_indicators": suspicious_indicators,
            "compliance_status": compliance_status,
            "user_id": user_data.get("user_id"),
        }

    async def generate_regulatory_report(
        self, db: AsyncSession, reporting_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate a regulatory compliance report."""
        import uuid as _uuid
        from datetime import timedelta

        report_type = reporting_data.get("report_type", "SAR")
        jurisdiction = reporting_data.get("jurisdiction", "US")

        deadlines = {"SAR": 30, "CTR": 15, "FBAR": 365}
        days = deadlines.get(report_type, 30)

        return {
            "report_id": str(_uuid.uuid4()),
            "report_type": report_type,
            "status": "pending",
            "jurisdiction": jurisdiction,
            "submission_deadline": (
                datetime.now(timezone.utc) + timedelta(days=days)
            ).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "user_id": reporting_data.get("user_id"),
        }

    async def create_compliance_alert(
        self, db: AsyncSession, alert_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a compliance alert."""
        import uuid as _uuid

        return {
            "alert_id": str(_uuid.uuid4()),
            "user_id": alert_data.get("user_id"),
            "alert_type": alert_data.get("alert_type"),
            "severity": alert_data.get("severity"),
            "description": alert_data.get("description"),
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "metadata": alert_data.get("metadata", {}),
        }

    def calculate_risk_score(self, risk_factors: Dict[str, Any]) -> float:
        """Calculate a composite risk score from multiple risk factors."""
        score = 0.0

        country_risk = float(risk_factors.get("country_risk", 0.0))
        score += country_risk * 0.25

        amount = float(risk_factors.get("transaction_amount", 0))
        if amount >= 10000:
            score += min(0.2, amount / 500000)

        frequency = int(risk_factors.get("frequency", 0))
        if frequency > 10:
            score += min(0.15, (frequency - 10) * 0.01)

        kyc_level = risk_factors.get("kyc_level", "enhanced")
        kyc_scores = {"enhanced": 0.0, "standard": 0.05, "basic": 0.15, "none": 0.3}
        score += kyc_scores.get(kyc_level, 0.1)

        if risk_factors.get("sanctions_match", False):
            score += 0.5

        if risk_factors.get("pep_status", False):
            score += 0.3

        return min(1.0, score)

    def analyze_transaction_patterns(
        self, transactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyse a list of transactions for suspicious patterns."""
        if not transactions:
            return {"pattern_type": "normal", "risk_indicators": []}

        amounts = [float(t.get("amount", 0)) for t in transactions]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0
        risk_indicators: List[str] = []

        structuring_threshold = 10000
        close_amounts = [
            a
            for a in amounts
            if structuring_threshold * 0.8 <= a < structuring_threshold
        ]
        if len(close_amounts) >= 3:
            risk_indicators.append("potential_structuring")

        if avg_amount >= structuring_threshold:
            risk_indicators.append("high_average_transaction_value")

        if len(transactions) >= 5:
            from datetime import timedelta

            timestamps = [
                t.get("timestamp") for t in transactions if t.get("timestamp")
            ]
            if timestamps:
                time_span = max(timestamps) - min(timestamps)
                if time_span < timedelta(hours=24):
                    risk_indicators.append("rapid_transaction_velocity")

        pattern_type = "suspicious" if risk_indicators else "normal"

        return {
            "pattern_type": pattern_type,
            "risk_indicators": risk_indicators,
            "transaction_count": len(transactions),
            "average_amount": avg_amount,
        }

    def get_jurisdiction_rules(self, jurisdiction: str) -> Dict[str, Any]:
        """Return compliance rules for a given jurisdiction."""
        rules: Dict[str, Any] = {
            "jurisdiction": jurisdiction,
            "kyc_requirements": ["identity_verification", "address_verification"],
            "sanctions_lists": ["OFAC", "UN"],
            "transaction_reporting_threshold": 10000,
            "aml_requirements": True,
        }

        if jurisdiction == "US":
            rules.update(
                {
                    "transaction_reporting_threshold": 10000,
                    "sanctions_lists": ["OFAC", "FinCEN", "BIS"],
                    "sar_required": True,
                    "ctr_required": True,
                    "fbar_required": True,
                }
            )
        elif jurisdiction in ("EU", "EUR"):
            rules.update(
                {
                    "transaction_reporting_threshold": 10000,
                    "gdpr_compliance": True,
                    "mld5_requirements": True,
                    "pep_screening": True,
                    "beneficial_ownership": True,
                }
            )
        elif jurisdiction == "UK":
            rules.update(
                {
                    "transaction_reporting_threshold": 10000,
                    "mlr_2017": True,
                    "pep_screening": True,
                }
            )

        return rules

    def validate_compliance_workflow(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a compliance workflow for completeness."""
        required_steps = [
            "kyc_completion",
            "document_verification",
            "sanctions_screening",
        ]
        missing_steps: List[str] = []
        for step in required_steps:
            value = workflow.get(step)
            if not value:
                missing_steps.append(step)

        is_valid = len(missing_steps) == 0

        optional_steps = ["biometric_verification", "risk_assessment"]
        completed_optional = [s for s in optional_steps if workflow.get(s)]

        return {
            "is_valid": is_valid,
            "missing_steps": missing_steps,
            "completed_steps": [s for s in required_steps if s not in missing_steps],
            "optional_completed": completed_optional,
            "compliance_level": "full" if is_valid else "partial",
        }
