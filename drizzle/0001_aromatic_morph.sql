CREATE TABLE `adaptive_routes` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`recommendedPath` json NOT NULL,
`nextUnitId` int,
`reasoning` text,
`generatedAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `adaptive_routes_id` PRIMARY KEY(`id`),
INDEX `user_idx` (`userId`)
);

CREATE TABLE `chatbot_interactions` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`role` enum('mentor','asesor','motivador') NOT NULL,
`messages` json DEFAULT '[]',
`context` json DEFAULT '{}',
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `chatbot_interactions_id` PRIMARY KEY(`id`),
INDEX `user_idx` (`userId`)
);

CREATE TABLE `contents` (
`id` int AUTO_INCREMENT NOT NULL,
`unitId` int NOT NULL,
`type` enum('video','podcast','ebook','infografia','quiz') NOT NULL,
`data` json NOT NULL,
`createdBy` int NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `contents_id` PRIMARY KEY(`id`),
INDEX `unit_idx` (`unitId`)
);

CREATE TABLE `evaluation_answers` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`evaluationId` int NOT NULL,
`answers` json NOT NULL,
`score` int,
`passed` boolean DEFAULT false,
`completedAt` timestamp,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `evaluation_answers_id` PRIMARY KEY(`id`),
INDEX `user_idx` (`userId`),
INDEX `evaluation_idx` (`evaluationId`)
);

CREATE TABLE `evaluations` (
`id` int AUTO_INCREMENT NOT NULL,
`unitId` int NOT NULL,
`questions` json NOT NULL,
`passingScore` int NOT NULL DEFAULT 70,
`timeLimit` int,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `evaluations_id` PRIMARY KEY(`id`),
INDEX `unit_idx` (`unitId`)
);

CREATE TABLE `gamification` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL UNIQUE,
`totalPoints` int DEFAULT 0,
`badges` json DEFAULT '[]',
`currentLevel` int DEFAULT 1,
`streak` int DEFAULT 0,
`lastActivityDate` timestamp,
`achievements` json DEFAULT '[]',
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `gamification_id` PRIMARY KEY(`id`),
INDEX `user_idx` (`userId`)
);

CREATE TABLE `initial_diagnostics` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`responses` json NOT NULL,
`resultLevel` int,
`adaptiveRouteId` int,
`completedAt` timestamp,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `initial_diagnostics_id` PRIMARY KEY(`id`),
INDEX `user_idx` (`userId`)
);

CREATE TABLE `levels` (
`id` int AUTO_INCREMENT NOT NULL,
`phaseId` int NOT NULL,
`name` varchar(100) NOT NULL,
`description` text,
`order` int NOT NULL,
`requirements` json DEFAULT '{}',
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `levels_id` PRIMARY KEY(`id`),
INDEX `phase_idx` (`phaseId`)
);

CREATE TABLE `mentor_assignments` (
`id` int AUTO_INCREMENT NOT NULL,
`mentorId` int NOT NULL,
`studentId` int NOT NULL,
`assignedAt` timestamp NOT NULL DEFAULT (now()),
`notes` text,
`active` boolean DEFAULT true,
CONSTRAINT `mentor_assignments_id` PRIMARY KEY(`id`),
INDEX `mentor_idx` (`mentorId`),
INDEX `student_idx` (`studentId`)
);

CREATE TABLE `modules` (
`id` int AUTO_INCREMENT NOT NULL,
`levelId` int NOT NULL,
`name` varchar(150) NOT NULL,
`description` text,
`order` int NOT NULL,
`learningObjectives` json DEFAULT '[]',
`estimatedHours` decimal(5,2),
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `modules_id` PRIMARY KEY(`id`),
INDEX `level_idx` (`levelId`)
);

CREATE TABLE `phases` (
`id` int AUTO_INCREMENT NOT NULL,
`name` varchar(100) NOT NULL,
`description` text,
`order` int NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `phases_id` PRIMARY KEY(`id`)
);

CREATE TABLE `units` (
`id` int AUTO_INCREMENT NOT NULL,
`moduleId` int NOT NULL,
`name` varchar(150) NOT NULL,
`description` text,
`order` int NOT NULL,
`contentType` enum('video','podcast','ebook','infografia','quiz') NOT NULL,
`contentUrl` text,
`duration` int,
`estimatedTime` int,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `units_id` PRIMARY KEY(`id`),
INDEX `module_idx` (`moduleId`)
);

CREATE TABLE `user_progress` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`unitId` int NOT NULL,
`status` enum('no_iniciado','en_progreso','completado') NOT NULL DEFAULT 'no_iniciado',
`percentageComplete` int DEFAULT 0,
`lastAccessedAt` timestamp,
`completedAt` timestamp,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `user_progress_id` PRIMARY KEY(`id`),
INDEX `user_idx` (`userId`),
INDEX `unit_idx` (`unitId`)
);
