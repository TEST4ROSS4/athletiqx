<?php

namespace App\Services;

class ComplianceCalculationService
{
    /**
     * Calculate overall compliance score based on sets, reps, weight, and duration
     */
    public static function calculateComplianceScore(
        int $setsAssigned,
        int $setsCompleted,
        int $repsAssigned,
        int $repsCompleted,
        float $weightAssigned,
        float $weightActual,
        int $durationAssigned,
        int $durationActual
    ): float {
        $setCompliance = ($setsCompleted / max($setsAssigned, 1)) * 100;
        $repCompliance = ($repsCompleted / max($repsAssigned, 1)) * 100;
        $weightCompliance = ($weightActual / max($weightAssigned, 1)) * 100;
        $durationCompliance = ($durationActual / max($durationAssigned, 1)) * 100;

        $score = ($setCompliance * 0.4) + ($repCompliance * 0.3) + ($weightCompliance * 0.2) + ($durationCompliance * 0.1);
        return min(round($score, 2), 100);
    }

    /**
     * Calculate variance percentage
     */
    public static function calculateVariancePercentage(float $actual, float $assigned): float
    {
        if ($assigned == 0) {
            return 0;
        }
        $variance = $actual - $assigned;
        return round(($variance / $assigned) * 100, 2);
    }

    /**
     * Determine alert type based on compliance score and variance
     */
    public static function getAlertType(float $complianceScore, float $variancePercentage): ?string
    {
        if ($complianceScore < 80) {
            return 'low_compliance';
        }
        if ($variancePercentage < -20) {
            return 'under_performance';
        }
        if ($variancePercentage > 20) {
            return 'over_performance';
        }
        return null;
    }

    /**
     * Get alert severity based on type
     */
    public static function getAlertSeverity(string $alertType): string
    {
        return match ($alertType) {
            'low_compliance' => 'high',
            'under_performance' => 'medium',
            'over_performance' => 'low',
            default => 'medium',
        };
    }

    /**
     * Generate alert message
     */
    public static function generateAlertMessage(string $alertType, float $complianceScore, float $variancePercentage): string
    {
        return match ($alertType) {
            'low_compliance' => 'Compliance score is below 80%: ' . $complianceScore . '%',
            'under_performance' => 'Performance is ' . abs($variancePercentage) . '% below target',
            'over_performance' => 'Excellent performance: ' . $variancePercentage . '% above target',
            default => 'Training logged',
        };
    }
}
