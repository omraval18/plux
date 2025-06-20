import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useDashboardData = () => {
    const [user, setUser] = useState(null);
    const [subscriptionPlan, setSubscriptionPlan] = useState(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [userRes, subscriptionRes] = await Promise.all([
                    fetch("/api/user"),
                    fetch("/api/user/subscription"),
                ]);

                if (userRes.status === 401) {
                    router.push("/auth-callback?origin=dashboard");
                    return;
                }

                if (!userRes.ok || !subscriptionRes.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }

                const [userData, subscriptionData] = await Promise.all([
                    userRes.json(),
                    subscriptionRes.json(),
                ]);

                if (!userData) {
                    router.push("/auth-callback?origin=dashboard");
                    return;
                }

                setUser(userData);
                setSubscriptionPlan(subscriptionData);
            } catch (err) {
                setError(`${err}`);
                console.error("Dashboard data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    return { user, subscriptionPlan, loading, error };
};
