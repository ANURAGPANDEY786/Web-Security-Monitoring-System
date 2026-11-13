# Web Security Monitoring System (SIEM-Lite)

A web-based Security Information and Event Management (SIEM) platform designed to ingest security logs, monitor suspicious activities, and scan web application URLs for potential security vulnerabilities.

This project is an extended and customized implementation based on an existing SIEM-Lite project, with additional backend development, MySQL integration, Docker containerization, and OWASP ZAP integration.

## Features

### 1. Log Ingestion & Security Monitoring

The system supports collecting security logs through log ingestion workflows.

- **Self-Uploaded Logs:** Upload log files for ingestion and security analysis.
- **SSH Authentication Logs:** Ingest authentication events, including failed SSH login attempts.
- **Security Event Monitoring:** Track and analyze ingested security events.
- **Suspicious Activity Monitoring:** Identify repeated failed login attempts and potential brute-force activity.
- **Database Storage:** Persist security events in MySQL.
- **Dashboard:** View security monitoring information and event activity.

### 2. URL Vulnerability Scanner

An integrated URL scanning module powered by OWASP ZAP.

- Submit a target URL through the scanner interface.
- Perform automated web application vulnerability scans.
- Integrate the Spring Boot backend with OWASP ZAP.
- Identify potential web security vulnerabilities.
- Scan for issues such as:
  - SQL Injection (SQLi)
  - Cross-Site Scripting (XSS)

### 3. Authentication & Authorization

- User registration and login.
- JWT-based authentication.
- Spring Security integration.
- Role-based access control.

### 4. Database Integration

- MySQL 8.4 for persistent data storage.
- Store security events and application data.
- Docker-based MySQL deployment.
- Persistent database storage using Docker volumes.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Java, Spring Boot |
| Database | MySQL 8.4 |
| Authentication | Spring Security, JWT |
| Vulnerability Scanner | OWASP ZAP |
| Containerization | Docker |
| Deployment | Vercel, Azure Virtual Machine |
| Web Server | Nginx |
| HTTPS | Let's Encrypt, Certbot |

## System Architecture

```text
                         User
                           |
                           v
                 React + TypeScript
                           |
                       REST APIs
                           |
                           v
                 Spring Boot Backend
                    /           \
                   /             \
                  v               v
            Log Ingestion      URL Scanner
                  |               |
          +-------+-------+       v
          |               |   OWASP ZAP
          v               v
     Uploaded Logs    SSH/Auth Logs
          |               |
          +-------+-------+
                  |
                  v
              MySQL DB
```

## Docker Implementation

Docker is used to run the backend infrastructure in separate containers.

- **Spring Boot:** Backend application container.
- **MySQL:** Database container.
- **OWASP ZAP:** Vulnerability scanner container.
- **Docker Network:** Private communication between containers.
- **Docker Volume:** Persistent database storage.
- **Restart Policies:** Automatic container restart configuration.

## Deployment Architecture

The application is deployed using the following infrastructure:

| Component | Deployment |
|---|---|
| Frontend | Vercel |
| Backend | Azure Virtual Machine |
| Database | MySQL Docker Container |
| Scanner | OWASP ZAP Docker Container |
| Reverse Proxy | Nginx |
| Secure Connection | HTTPS / Certbot |

## Project Workflow

1. Users access the web application through the frontend.
2. Security logs are uploaded or ingested through the Log Ingestion module.
3. The Spring Boot backend processes and stores security events in MySQL.
4. Users can submit a target URL through the URL Scanner.
5. The backend communicates with OWASP ZAP to execute the vulnerability scan.
6. Scan results are made available through the application interface.

## Getting Started

### Prerequisites

- Java 21
- Node.js and npm
- MySQL 8.4
- Docker
- Maven

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run the Backend

Configure the required database and application environment variables, then run:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

**Note:** Configure MySQL and OWASP ZAP connection settings before starting the backend. Exact configuration may vary according to your local environment.

## Project Objective

The objective of this project is to build practical experience in:

- Security monitoring and log analysis.
- Backend development using Java and Spring Boot.
- Web vulnerability scanning.
- Database integration and persistence.
- Authentication and authorization.
- Docker-based application deployment.
- Cloud hosting and infrastructure configuration.

## Acknowledgement

This project is based on and extends the existing [SIEM-Lite repository](https://github.com/guty09/siem-lite).

The original project has been customized and extended with additional features, integrations, and deployment configurations.

## Author

**Anurag Pandey**

B.Tech — Computer Science and Engineering  
Institute of Engineering and Technology, Lucknow

- GitHub: [ANURAGPANDEY786](https://github.com/ANURAGPANDEY786)
- Project Repository: [Web Security Monitoring System](https://github.com/ANURAGPANDEY786/Web-Security-Monitoring-System)

---

*Developed as a practical project in security monitoring, backend engineering, and web application security.*
