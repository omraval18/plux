"use client";

import Dashboard from "@/components/Dashboard";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardWrapper() {
    const router = useRouter();
    const { user, subscriptionPlan, loading, error } = useDashboardData();

    useEffect(() => {
        if (!loading && (error || !user || !subscriptionPlan)) {
            router.push("/auth-callback?origin=dashboard");
        }
    }, [loading, error, user, subscriptionPlan, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !user || !subscriptionPlan) {
        return null; // Return null while redirecting
    }

    return <Dashboard subscriptionPlan={subscriptionPlan} />;
}
