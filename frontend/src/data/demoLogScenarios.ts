export interface DemoLogScenario {
    name: string;
    severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mitre: string;
    description: string;
    logs: string;
}

export const scenarios: DemoLogScenario[] = [
    {
        name: "SSH Failed Login",
        severity: "LOW",
        mitre: "T1110",
        description: "Single failed SSH login attempt.",
        logs: "Jul 01 18:45:12 web01 sshd[1234]: Failed password for admin from 192.168.1.100 port 51422 ssh2",
    },
    {
        name: "SSH Successful Login",
        severity: "INFO",
        mitre: "T1078",
        description: "Single successful SSH login.",
        logs: "Jul 01 18:46:12 web01 sshd[1235]: Accepted password for admin from 192.168.1.100 port 51423 ssh2",
    },
    {
        name: "Admin Command",
        severity: "MEDIUM",
        mitre: "T1068",
        description: "Admin-level sudo command execution.",
        logs: "sudo command executed by root from 192.168.1.100",
    },
    {
        name: "Connection Attempt",
        severity: "INFO",
        mitre: "T1046",
        description: "Single connection attempt to a destination port.",
        logs: "Connection attempt from 192.168.1.50 to port 22",
    },
    {
        name: "Brute Force",
        severity: "HIGH",
        mitre: "T1110",
        description: "Five failed SSH logins from the same source IP.",
        logs: [
            "Jul 01 18:45:01 web01 sshd[1001]: Failed password for admin from 192.168.1.100 port 51421 ssh2",
            "Jul 01 18:45:20 web01 sshd[1002]: Failed password for admin from 192.168.1.100 port 51422 ssh2",
            "Jul 01 18:45:40 web01 sshd[1003]: Failed password for admin from 192.168.1.100 port 51423 ssh2",
            "Jul 01 18:46:00 web01 sshd[1004]: Failed password for admin from 192.168.1.100 port 51424 ssh2",
            "Jul 01 18:46:20 web01 sshd[1005]: Failed password for admin from 192.168.1.100 port 51425 ssh2",
        ].join("\n"),
    },
    {
        name: "Aggressive Brute Force",
        severity: "CRITICAL",
        mitre: "T1110",
        description: "Twenty failed SSH logins from the same source IP.",
        logs: Array.from(
            { length: 20 },
            (_, i) =>
                `Jul 01 18:45:${String(i).padStart(2, "0")} web01 sshd[20${i}]: Failed password for admin from 192.168.1.101 port ${52000 + i} ssh2`
        ).join("\n"),
    },
    {
        name: "Password Spray",
        severity: "HIGH",
        mitre: "T1110.003",
        description: "One source IP attempts multiple usernames.",
        logs: [
            "Jul 01 18:47:01 web01 sshd[3001]: Failed password for admin from 192.168.1.102 port 53001 ssh2",
            "Jul 01 18:47:10 web01 sshd[3002]: Failed password for root from 192.168.1.102 port 53002 ssh2",
            "Jul 01 18:47:20 web01 sshd[3003]: Failed password for test from 192.168.1.102 port 53003 ssh2",
            "Jul 01 18:47:30 web01 sshd[3004]: Failed password for oracle from 192.168.1.102 port 53004 ssh2",
            "Jul 01 18:47:40 web01 sshd[3005]: Failed password for service from 192.168.1.102 port 53005 ssh2",
        ].join("\n"),
    },
    {
        name: "Account Compromise",
        severity: "CRITICAL",
        mitre: "T1078",
        description: "Failed logins followed by a successful login from the same IP.",
        logs: [
            "Jul 01 18:48:01 web01 sshd[4001]: Failed password for admin from 192.168.1.103 port 54001 ssh2",
            "Jul 01 18:48:10 web01 sshd[4002]: Failed password for admin from 192.168.1.103 port 54002 ssh2",
            "Jul 01 18:48:20 web01 sshd[4003]: Failed password for admin from 192.168.1.103 port 54003 ssh2",
            "Jul 01 18:48:30 web01 sshd[4004]: Failed password for admin from 192.168.1.103 port 54004 ssh2",
            "Jul 01 18:48:40 web01 sshd[4005]: Failed password for admin from 192.168.1.103 port 54005 ssh2",
            "Jul 01 18:49:00 web01 sshd[4006]: Accepted password for admin from 192.168.1.103 port 54006 ssh2",
        ].join("\n"),
    },
    {
        name: "Privilege Escalation",
        severity: "CRITICAL",
        mitre: "T1068",
        description: "Failed logins, successful login, then sudo command execution.",
        logs: [
            "Jul 01 18:50:01 web01 sshd[5001]: Failed password for admin from 192.168.1.104 port 55001 ssh2",
            "Jul 01 18:50:10 web01 sshd[5002]: Failed password for admin from 192.168.1.104 port 55002 ssh2",
            "Jul 01 18:50:20 web01 sshd[5003]: Failed password for admin from 192.168.1.104 port 55003 ssh2",
            "Jul 01 18:50:30 web01 sshd[5004]: Failed password for admin from 192.168.1.104 port 55004 ssh2",
            "Jul 01 18:50:40 web01 sshd[5005]: Failed password for admin from 192.168.1.104 port 55005 ssh2",
            "Jul 01 18:51:00 web01 sshd[5006]: Accepted password for admin from 192.168.1.104 port 55006 ssh2",
            "sudo command executed by admin from 192.168.1.104",
        ].join("\n"),
    },
    {
        name: "Port Scan",
        severity: "HIGH",
        mitre: "T1046",
        description: "One source IP attempts connections to ten different ports.",
        logs: [22, 80, 135, 139, 443, 445, 1433, 3306, 3389, 8080]
            .map((port) => `Connection attempt from 192.168.1.50 to port ${port}`)
            .join("\n"),
    },
    {
        name: "IOC Match - Cobalt Strike",
        severity: "CRITICAL",
        mitre: "T1071",
        description: "Failed SSH login from a seeded Cobalt Strike command-and-control IOC.",
        logs: "Jul 01 19:00:00 web01 sshd[9001]: Failed password for admin from 192.168.1.200 port 60001 ssh2",
    },
    {
        name: "IOC Match - Mirai",
        severity: "HIGH",
        mitre: "T1071",
        description: "Failed SSH login from a seeded Mirai botnet command-and-control IOC.",
        logs: "Jul 01 19:05:10 web01 sshd[9002]: Failed password for backup from 45.77.10.15 port 52331 ssh2",
    },
    {
        name: "IOC Match - Password Spray Source",
        severity: "HIGH",
        mitre: "T1110.003",
        description: "Failed SSH login from a seeded password-spray IOC source.",
        logs: "Jul 01 19:10:14 web01 sshd[9003]: Failed password for root from 203.0.113.50 port 40022 ssh2",
    },
    {
        name: "IOC Match - QakBot",
        severity: "CRITICAL",
        mitre: "T1071",
        description: "Failed SSH login from a seeded QakBot-related IOC source.",
        logs: "Jul 01 19:15:44 web01 sshd[9004]: Failed password for deploy from 198.51.100.25 port 44444 ssh2",
    },
];