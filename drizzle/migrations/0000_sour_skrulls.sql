CREATE TYPE "public"."chatbot_role" AS ENUM('mentor', 'asesor', 'motivador');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('video', 'podcast', 'ebook', 'infografia', 'quiz');--> statement-breakpoint
CREATE TYPE "public"."progress_status" AS ENUM('no_iniciado', 'en_progreso', 'completado');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('emprendedor', 'mentor', 'admin');--> statement-breakpoint
CREATE TABLE "adaptive_routes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "adaptive_routes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"recommendedPath" jsonb NOT NULL,
	"nextUnitId" integer,
	"reasoning" text,
	"generatedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_interactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chatbot_interactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"role" "chatbot_role" NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb,
	"context" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"unitId" integer NOT NULL,
	"type" "content_type" NOT NULL,
	"data" jsonb NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_answers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "evaluation_answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"evaluationId" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer,
	"passed" boolean DEFAULT false,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "evaluations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"unitId" integer NOT NULL,
	"questions" jsonb NOT NULL,
	"passingScore" integer DEFAULT 70 NOT NULL,
	"timeLimit" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gamification_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"totalPoints" integer DEFAULT 0,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"currentLevel" integer DEFAULT 1,
	"streak" integer DEFAULT 0,
	"lastActivityDate" timestamp,
	"achievements" jsonb DEFAULT '[]'::jsonb,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gamification_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "initial_diagnostics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "initial_diagnostics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"responses" jsonb NOT NULL,
	"resultLevel" integer,
	"adaptiveRouteId" integer,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "levels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"phaseId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"requirements" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_assignments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_assignments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mentorId" integer NOT NULL,
	"studentId" integer NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "modules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"levelId" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"learningObjectives" jsonb DEFAULT '[]'::jsonb,
	"estimatedHours" numeric(5, 2),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "phases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "units_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"moduleId" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"contentType" "content_type" NOT NULL,
	"contentUrl" text,
	"duration" integer,
	"estimatedTime" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"unitId" integer NOT NULL,
	"status" "progress_status" DEFAULT 'no_iniciado' NOT NULL,
	"percentageComplete" integer DEFAULT 0,
	"lastAccessedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'emprendedor' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "adaptive_routes_user_idx" ON "adaptive_routes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chatbot_interactions_user_idx" ON "chatbot_interactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "contents_unit_idx" ON "contents" USING btree ("unitId");--> statement-breakpoint
CREATE INDEX "evaluation_answers_user_idx" ON "evaluation_answers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "evaluation_answers_evaluation_idx" ON "evaluation_answers" USING btree ("evaluationId");--> statement-breakpoint
CREATE INDEX "evaluations_unit_idx" ON "evaluations" USING btree ("unitId");--> statement-breakpoint
CREATE INDEX "gamification_user_idx" ON "gamification" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "initial_diagnostics_user_idx" ON "initial_diagnostics" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "levels_phase_idx" ON "levels" USING btree ("phaseId");--> statement-breakpoint
CREATE INDEX "mentor_idx" ON "mentor_assignments" USING btree ("mentorId");--> statement-breakpoint
CREATE INDEX "student_idx" ON "mentor_assignments" USING btree ("studentId");--> statement-breakpoint
CREATE INDEX "modules_level_idx" ON "modules" USING btree ("levelId");--> statement-breakpoint
CREATE INDEX "units_module_idx" ON "units" USING btree ("moduleId");--> statement-breakpoint
CREATE INDEX "user_progress_user_idx" ON "user_progress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_progress_unit_idx" ON "user_progress" USING btree ("unitId");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");