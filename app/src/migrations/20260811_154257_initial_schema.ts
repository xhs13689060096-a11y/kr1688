import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ai_tasks_task_type" AS ENUM('translation_assist', 'metadata_generation', 'comment_moderation', 'seo_copy_draft', 'performance_insight');
  CREATE TYPE "public"."enum_ai_tasks_status" AS ENUM('queued', 'processing', 'draft_complete', 'approved', 'rejected', 'failed');
  CREATE TYPE "public"."enum__ai_tasks_v_version_task_type" AS ENUM('translation_assist', 'metadata_generation', 'comment_moderation', 'seo_copy_draft', 'performance_insight');
  CREATE TYPE "public"."enum__ai_tasks_v_version_status" AS ENUM('queued', 'processing', 'draft_complete', 'approved', 'rejected', 'failed');
  CREATE TYPE "public"."enum_chapters_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum__chapters_v_version_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_comments_status" AS ENUM('published', 'hidden');
  CREATE TYPE "public"."enum__comments_v_version_status" AS ENUM('published', 'hidden');
  CREATE TYPE "public"."enum_stories_content_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__stories_v_version_content_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_media_type" AS ENUM('cover', 'audio', 'video', 'epub', 'image');
  CREATE TYPE "public"."enum_media_rights_status" AS ENUM('unknown', 'reviewing', 'cleared', 'restricted', 'expired', 'rejected');
  CREATE TYPE "public"."enum_media_provider" AS ENUM('local', 'r2');
  CREATE TYPE "public"."enum__media_v_version_media_type" AS ENUM('cover', 'audio', 'video', 'epub', 'image');
  CREATE TYPE "public"."enum__media_v_version_rights_status" AS ENUM('unknown', 'reviewing', 'cleared', 'restricted', 'expired', 'rejected');
  CREATE TYPE "public"."enum__media_v_version_provider" AS ENUM('local', 'r2');
  CREATE TYPE "public"."enum_users_role" AS ENUM('reader', 'admin');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_default_direction" AS ENUM('rtl', 'ltr');
  CREATE TYPE "public"."enum__site_settings_v_version_default_direction" AS ENUM('rtl', 'ltr');
  CREATE TABLE "folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_h_folders_id" integer,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_folders_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__h_folders_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ai_tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"task_type" "enum_ai_tasks_task_type" NOT NULL,
  	"status" "enum_ai_tasks_status" DEFAULT 'queued',
  	"input" jsonb,
  	"output" jsonb,
  	"model" varchar,
  	"prompt_version" varchar,
  	"cost" numeric,
  	"approved_by_id" integer,
  	"error" varchar,
  	"is_draft_output" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ai_tasks_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"stories_id" integer,
  	"chapters_id" integer
  );
  
  CREATE TABLE "_ai_tasks_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_task_type" "enum__ai_tasks_v_version_task_type" NOT NULL,
  	"version_status" "enum__ai_tasks_v_version_status" DEFAULT 'queued',
  	"version_input" jsonb,
  	"version_output" jsonb,
  	"version_model" varchar,
  	"version_prompt_version" varchar,
  	"version_cost" numeric,
  	"version_approved_by_id" integer,
  	"version_error" varchar,
  	"version_is_draft_output" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_ai_tasks_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"stories_id" integer,
  	"chapters_id" integer
  );
  
  CREATE TABLE "chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"body_ar" jsonb,
  	"title_zh" varchar,
  	"body_zh" jsonb,
  	"slug" varchar,
  	"chapter_number" numeric NOT NULL,
  	"story_id" integer NOT NULL,
  	"word_count" numeric,
  	"status" "enum_chapters_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"demo_only" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_chapters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title_ar" varchar NOT NULL,
  	"version_body_ar" jsonb,
  	"version_title_zh" varchar,
  	"version_body_zh" jsonb,
  	"version_slug" varchar,
  	"version_chapter_number" numeric NOT NULL,
  	"version_story_id" integer NOT NULL,
  	"version_word_count" numeric,
  	"version_status" "enum__chapters_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_demo_only" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb NOT NULL,
  	"author_id" integer NOT NULL,
  	"story_id" integer,
  	"chapter_id" integer,
  	"parent_id" integer,
  	"status" "enum_comments_status" DEFAULT 'published',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_comments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_body" jsonb NOT NULL,
  	"version_author_id" integer NOT NULL,
  	"version_story_id" integer,
  	"version_chapter_id" integer,
  	"version_parent_id" integer,
  	"version_status" "enum__comments_v_version_status" DEFAULT 'published',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "favorites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"story_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_favorites_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_user_id" integer NOT NULL,
  	"version_story_id" integer NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reading_progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"story_id" integer NOT NULL,
  	"chapter_id" integer,
  	"progress_percentage" numeric DEFAULT 0,
  	"last_read_at" timestamp(3) with time zone,
  	"completed" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_reading_progress_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_user_id" integer NOT NULL,
  	"version_story_id" integer NOT NULL,
  	"version_chapter_id" integer,
  	"version_progress_percentage" numeric DEFAULT 0,
  	"version_last_read_at" timestamp(3) with time zone,
  	"version_completed" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stories_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"synopsis_ar" jsonb,
  	"title_zh" varchar,
  	"synopsis_zh" jsonb,
  	"slug" varchar,
  	"author_name" varchar,
  	"genre" varchar,
  	"cover_image_id" integer,
  	"total_chapters" numeric,
  	"content_status" "enum_stories_content_status" DEFAULT 'draft',
  	"demo_only" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_stories_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_stories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title_ar" varchar NOT NULL,
  	"version_synopsis_ar" jsonb,
  	"version_title_zh" varchar,
  	"version_synopsis_zh" jsonb,
  	"version_slug" varchar,
  	"version_author_name" varchar,
  	"version_genre" varchar,
  	"version_cover_image_id" integer,
  	"version_total_chapters" numeric,
  	"version_content_status" "enum__stories_v_version_content_status" DEFAULT 'draft',
  	"version_demo_only" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"_h_folders_id" integer,
  	"caption" jsonb,
  	"alt_ar" varchar,
  	"media_type" "enum_media_media_type" DEFAULT 'image',
  	"rights_status" "enum_media_rights_status" DEFAULT 'unknown',
  	"source_url" varchar,
  	"source_label" varchar,
  	"demo_only" boolean DEFAULT false,
  	"provider" "enum_media_provider" DEFAULT 'local',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar,
  	"version__h_folders_id" integer,
  	"version_caption" jsonb,
  	"version_alt_ar" varchar,
  	"version_media_type" "enum__media_v_version_media_type" DEFAULT 'image',
  	"version_rights_status" "enum__media_v_version_rights_status" DEFAULT 'unknown',
  	"version_source_url" varchar,
  	"version_source_label" varchar,
  	"version_demo_only" boolean DEFAULT false,
  	"version_provider" "enum__media_v_version_provider" DEFAULT 'local',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"version_sizes_thumbnail_url" varchar,
  	"version_sizes_thumbnail_width" numeric,
  	"version_sizes_thumbnail_height" numeric,
  	"version_sizes_thumbnail_mime_type" varchar,
  	"version_sizes_thumbnail_filesize" numeric,
  	"version_sizes_thumbnail_filename" varchar,
  	"version_sizes_square_url" varchar,
  	"version_sizes_square_width" numeric,
  	"version_sizes_square_height" numeric,
  	"version_sizes_square_mime_type" varchar,
  	"version_sizes_square_filesize" numeric,
  	"version_sizes_square_filename" varchar,
  	"version_sizes_small_url" varchar,
  	"version_sizes_small_width" numeric,
  	"version_sizes_small_height" numeric,
  	"version_sizes_small_mime_type" varchar,
  	"version_sizes_small_filesize" numeric,
  	"version_sizes_small_filename" varchar,
  	"version_sizes_medium_url" varchar,
  	"version_sizes_medium_width" numeric,
  	"version_sizes_medium_height" numeric,
  	"version_sizes_medium_mime_type" varchar,
  	"version_sizes_medium_filesize" numeric,
  	"version_sizes_medium_filename" varchar,
  	"version_sizes_large_url" varchar,
  	"version_sizes_large_width" numeric,
  	"version_sizes_large_height" numeric,
  	"version_sizes_large_mime_type" varchar,
  	"version_sizes_large_filesize" numeric,
  	"version_sizes_large_filename" varchar,
  	"version_sizes_xlarge_url" varchar,
  	"version_sizes_xlarge_width" numeric,
  	"version_sizes_xlarge_height" numeric,
  	"version_sizes_xlarge_mime_type" varchar,
  	"version_sizes_xlarge_filesize" numeric,
  	"version_sizes_xlarge_filename" varchar,
  	"version_sizes_og_url" varchar,
  	"version_sizes_og_width" numeric,
  	"version_sizes_og_height" numeric,
  	"version_sizes_og_mime_type" varchar,
  	"version_sizes_og_filesize" numeric,
  	"version_sizes_og_filename" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_categories_v_version_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'reader' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"folders_id" integer,
  	"ai_tasks_id" integer,
  	"chapters_id" integer,
  	"comments_id" integer,
  	"favorites_id" integer,
  	"reading_progress_id" integer,
  	"stories_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"stories_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"stories_id" integer
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'KR1688' NOT NULL,
  	"site_description" varchar DEFAULT 'منصة القصص العربية — اقرأ واستمتع بأجمل القصص العربية' NOT NULL,
  	"default_locale" varchar DEFAULT 'ar' NOT NULL,
  	"default_direction" "enum_site_settings_default_direction" DEFAULT 'rtl' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'KR1688' NOT NULL,
  	"version_site_description" varchar DEFAULT 'منصة القصص العربية — اقرأ واستمتع بأجمل القصص العربية' NOT NULL,
  	"version_default_locale" varchar DEFAULT 'ar' NOT NULL,
  	"version_default_direction" "enum__site_settings_v_version_default_direction" DEFAULT 'rtl' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "folders" ADD CONSTRAINT "folders__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_parent_id_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_folders_v" ADD CONSTRAINT "_folders_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ai_tasks_rels" ADD CONSTRAINT "ai_tasks_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ai_tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_tasks_rels" ADD CONSTRAINT "ai_tasks_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_tasks_rels" ADD CONSTRAINT "ai_tasks_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ai_tasks_v" ADD CONSTRAINT "_ai_tasks_v_parent_id_ai_tasks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ai_tasks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ai_tasks_v" ADD CONSTRAINT "_ai_tasks_v_version_approved_by_id_users_id_fk" FOREIGN KEY ("version_approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ai_tasks_v_rels" ADD CONSTRAINT "_ai_tasks_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ai_tasks_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ai_tasks_v_rels" ADD CONSTRAINT "_ai_tasks_v_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ai_tasks_v_rels" ADD CONSTRAINT "_ai_tasks_v_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_parent_id_chapters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_chapters_v" ADD CONSTRAINT "_chapters_v_version_story_id_stories_id_fk" FOREIGN KEY ("version_story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comments_v" ADD CONSTRAINT "_comments_v_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comments_v" ADD CONSTRAINT "_comments_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comments_v" ADD CONSTRAINT "_comments_v_version_story_id_stories_id_fk" FOREIGN KEY ("version_story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comments_v" ADD CONSTRAINT "_comments_v_version_chapter_id_chapters_id_fk" FOREIGN KEY ("version_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comments_v" ADD CONSTRAINT "_comments_v_version_parent_id_comments_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "favorites" ADD CONSTRAINT "favorites_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favorites_v" ADD CONSTRAINT "_favorites_v_parent_id_favorites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."favorites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favorites_v" ADD CONSTRAINT "_favorites_v_version_user_id_users_id_fk" FOREIGN KEY ("version_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_favorites_v" ADD CONSTRAINT "_favorites_v_version_story_id_stories_id_fk" FOREIGN KEY ("version_story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reading_progress_v" ADD CONSTRAINT "_reading_progress_v_parent_id_reading_progress_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reading_progress"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reading_progress_v" ADD CONSTRAINT "_reading_progress_v_version_user_id_users_id_fk" FOREIGN KEY ("version_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reading_progress_v" ADD CONSTRAINT "_reading_progress_v_version_story_id_stories_id_fk" FOREIGN KEY ("version_story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reading_progress_v" ADD CONSTRAINT "_reading_progress_v_version_chapter_id_chapters_id_fk" FOREIGN KEY ("version_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories_tags" ADD CONSTRAINT "stories_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories" ADD CONSTRAINT "stories_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v_version_tags" ADD CONSTRAINT "_stories_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_parent_id_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stories_v" ADD CONSTRAINT "_stories_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_version_breadcrumbs" ADD CONSTRAINT "_categories_v_version_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_version_breadcrumbs" ADD CONSTRAINT "_categories_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_parent_id_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_folders_fk" FOREIGN KEY ("folders_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_tasks_fk" FOREIGN KEY ("ai_tasks_id") REFERENCES "public"."ai_tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_favorites_fk" FOREIGN KEY ("favorites_id") REFERENCES "public"."favorites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reading_progress_fk" FOREIGN KEY ("reading_progress_id") REFERENCES "public"."reading_progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "folders__h_folders_idx" ON "folders" USING btree ("_h_folders_id");
  CREATE INDEX "folders_updated_at_idx" ON "folders" USING btree ("updated_at");
  CREATE INDEX "folders_created_at_idx" ON "folders" USING btree ("created_at");
  CREATE INDEX "_folders_v_parent_idx" ON "_folders_v" USING btree ("parent_id");
  CREATE INDEX "_folders_v_version_version__h_folders_idx" ON "_folders_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_folders_v_version_version_updated_at_idx" ON "_folders_v" USING btree ("version_updated_at");
  CREATE INDEX "_folders_v_version_version_created_at_idx" ON "_folders_v" USING btree ("version_created_at");
  CREATE INDEX "_folders_v_created_at_idx" ON "_folders_v" USING btree ("created_at");
  CREATE INDEX "_folders_v_updated_at_idx" ON "_folders_v" USING btree ("updated_at");
  CREATE INDEX "ai_tasks_approved_by_idx" ON "ai_tasks" USING btree ("approved_by_id");
  CREATE INDEX "ai_tasks_updated_at_idx" ON "ai_tasks" USING btree ("updated_at");
  CREATE INDEX "ai_tasks_created_at_idx" ON "ai_tasks" USING btree ("created_at");
  CREATE INDEX "ai_tasks_rels_order_idx" ON "ai_tasks_rels" USING btree ("order");
  CREATE INDEX "ai_tasks_rels_parent_idx" ON "ai_tasks_rels" USING btree ("parent_id");
  CREATE INDEX "ai_tasks_rels_path_idx" ON "ai_tasks_rels" USING btree ("path");
  CREATE INDEX "ai_tasks_rels_stories_id_idx" ON "ai_tasks_rels" USING btree ("stories_id");
  CREATE INDEX "ai_tasks_rels_chapters_id_idx" ON "ai_tasks_rels" USING btree ("chapters_id");
  CREATE INDEX "_ai_tasks_v_parent_idx" ON "_ai_tasks_v" USING btree ("parent_id");
  CREATE INDEX "_ai_tasks_v_version_version_approved_by_idx" ON "_ai_tasks_v" USING btree ("version_approved_by_id");
  CREATE INDEX "_ai_tasks_v_version_version_updated_at_idx" ON "_ai_tasks_v" USING btree ("version_updated_at");
  CREATE INDEX "_ai_tasks_v_version_version_created_at_idx" ON "_ai_tasks_v" USING btree ("version_created_at");
  CREATE INDEX "_ai_tasks_v_created_at_idx" ON "_ai_tasks_v" USING btree ("created_at");
  CREATE INDEX "_ai_tasks_v_updated_at_idx" ON "_ai_tasks_v" USING btree ("updated_at");
  CREATE INDEX "_ai_tasks_v_rels_order_idx" ON "_ai_tasks_v_rels" USING btree ("order");
  CREATE INDEX "_ai_tasks_v_rels_parent_idx" ON "_ai_tasks_v_rels" USING btree ("parent_id");
  CREATE INDEX "_ai_tasks_v_rels_path_idx" ON "_ai_tasks_v_rels" USING btree ("path");
  CREATE INDEX "_ai_tasks_v_rels_stories_id_idx" ON "_ai_tasks_v_rels" USING btree ("stories_id");
  CREATE INDEX "_ai_tasks_v_rels_chapters_id_idx" ON "_ai_tasks_v_rels" USING btree ("chapters_id");
  CREATE UNIQUE INDEX "chapters_slug_idx" ON "chapters" USING btree ("slug");
  CREATE INDEX "chapters_story_idx" ON "chapters" USING btree ("story_id");
  CREATE INDEX "chapters_updated_at_idx" ON "chapters" USING btree ("updated_at");
  CREATE INDEX "chapters_created_at_idx" ON "chapters" USING btree ("created_at");
  CREATE INDEX "_chapters_v_parent_idx" ON "_chapters_v" USING btree ("parent_id");
  CREATE INDEX "_chapters_v_version_version_slug_idx" ON "_chapters_v" USING btree ("version_slug");
  CREATE INDEX "_chapters_v_version_version_story_idx" ON "_chapters_v" USING btree ("version_story_id");
  CREATE INDEX "_chapters_v_version_version_updated_at_idx" ON "_chapters_v" USING btree ("version_updated_at");
  CREATE INDEX "_chapters_v_version_version_created_at_idx" ON "_chapters_v" USING btree ("version_created_at");
  CREATE INDEX "_chapters_v_created_at_idx" ON "_chapters_v" USING btree ("created_at");
  CREATE INDEX "_chapters_v_updated_at_idx" ON "_chapters_v" USING btree ("updated_at");
  CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_id");
  CREATE INDEX "comments_story_idx" ON "comments" USING btree ("story_id");
  CREATE INDEX "comments_chapter_idx" ON "comments" USING btree ("chapter_id");
  CREATE INDEX "comments_parent_idx" ON "comments" USING btree ("parent_id");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE INDEX "_comments_v_parent_idx" ON "_comments_v" USING btree ("parent_id");
  CREATE INDEX "_comments_v_version_version_author_idx" ON "_comments_v" USING btree ("version_author_id");
  CREATE INDEX "_comments_v_version_version_story_idx" ON "_comments_v" USING btree ("version_story_id");
  CREATE INDEX "_comments_v_version_version_chapter_idx" ON "_comments_v" USING btree ("version_chapter_id");
  CREATE INDEX "_comments_v_version_version_parent_idx" ON "_comments_v" USING btree ("version_parent_id");
  CREATE INDEX "_comments_v_version_version_updated_at_idx" ON "_comments_v" USING btree ("version_updated_at");
  CREATE INDEX "_comments_v_version_version_created_at_idx" ON "_comments_v" USING btree ("version_created_at");
  CREATE INDEX "_comments_v_created_at_idx" ON "_comments_v" USING btree ("created_at");
  CREATE INDEX "_comments_v_updated_at_idx" ON "_comments_v" USING btree ("updated_at");
  CREATE INDEX "favorites_user_idx" ON "favorites" USING btree ("user_id");
  CREATE INDEX "favorites_story_idx" ON "favorites" USING btree ("story_id");
  CREATE INDEX "favorites_updated_at_idx" ON "favorites" USING btree ("updated_at");
  CREATE INDEX "favorites_created_at_idx" ON "favorites" USING btree ("created_at");
  CREATE INDEX "_favorites_v_parent_idx" ON "_favorites_v" USING btree ("parent_id");
  CREATE INDEX "_favorites_v_version_version_user_idx" ON "_favorites_v" USING btree ("version_user_id");
  CREATE INDEX "_favorites_v_version_version_story_idx" ON "_favorites_v" USING btree ("version_story_id");
  CREATE INDEX "_favorites_v_version_version_updated_at_idx" ON "_favorites_v" USING btree ("version_updated_at");
  CREATE INDEX "_favorites_v_version_version_created_at_idx" ON "_favorites_v" USING btree ("version_created_at");
  CREATE INDEX "_favorites_v_created_at_idx" ON "_favorites_v" USING btree ("created_at");
  CREATE INDEX "_favorites_v_updated_at_idx" ON "_favorites_v" USING btree ("updated_at");
  CREATE INDEX "reading_progress_user_idx" ON "reading_progress" USING btree ("user_id");
  CREATE INDEX "reading_progress_story_idx" ON "reading_progress" USING btree ("story_id");
  CREATE INDEX "reading_progress_chapter_idx" ON "reading_progress" USING btree ("chapter_id");
  CREATE INDEX "reading_progress_updated_at_idx" ON "reading_progress" USING btree ("updated_at");
  CREATE INDEX "reading_progress_created_at_idx" ON "reading_progress" USING btree ("created_at");
  CREATE INDEX "_reading_progress_v_parent_idx" ON "_reading_progress_v" USING btree ("parent_id");
  CREATE INDEX "_reading_progress_v_version_version_user_idx" ON "_reading_progress_v" USING btree ("version_user_id");
  CREATE INDEX "_reading_progress_v_version_version_story_idx" ON "_reading_progress_v" USING btree ("version_story_id");
  CREATE INDEX "_reading_progress_v_version_version_chapter_idx" ON "_reading_progress_v" USING btree ("version_chapter_id");
  CREATE INDEX "_reading_progress_v_version_version_updated_at_idx" ON "_reading_progress_v" USING btree ("version_updated_at");
  CREATE INDEX "_reading_progress_v_version_version_created_at_idx" ON "_reading_progress_v" USING btree ("version_created_at");
  CREATE INDEX "_reading_progress_v_created_at_idx" ON "_reading_progress_v" USING btree ("created_at");
  CREATE INDEX "_reading_progress_v_updated_at_idx" ON "_reading_progress_v" USING btree ("updated_at");
  CREATE INDEX "stories_tags_order_idx" ON "stories_tags" USING btree ("_order");
  CREATE INDEX "stories_tags_parent_id_idx" ON "stories_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "stories_slug_idx" ON "stories" USING btree ("slug");
  CREATE INDEX "stories_cover_image_idx" ON "stories" USING btree ("cover_image_id");
  CREATE INDEX "stories_updated_at_idx" ON "stories" USING btree ("updated_at");
  CREATE INDEX "stories_created_at_idx" ON "stories" USING btree ("created_at");
  CREATE INDEX "_stories_v_version_tags_order_idx" ON "_stories_v_version_tags" USING btree ("_order");
  CREATE INDEX "_stories_v_version_tags_parent_id_idx" ON "_stories_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_stories_v_parent_idx" ON "_stories_v" USING btree ("parent_id");
  CREATE INDEX "_stories_v_version_version_slug_idx" ON "_stories_v" USING btree ("version_slug");
  CREATE INDEX "_stories_v_version_version_cover_image_idx" ON "_stories_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_stories_v_version_version_updated_at_idx" ON "_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_stories_v_version_version_created_at_idx" ON "_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_stories_v_created_at_idx" ON "_stories_v" USING btree ("created_at");
  CREATE INDEX "_stories_v_updated_at_idx" ON "_stories_v" USING btree ("updated_at");
  CREATE INDEX "media__h_folders_idx" ON "media" USING btree ("_h_folders_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version__h_folders_idx" ON "_media_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_sizes_thumbnail_version_sizes_thumbnail_idx" ON "_media_v" USING btree ("version_sizes_thumbnail_filename");
  CREATE INDEX "_media_v_version_sizes_square_version_sizes_square_filen_idx" ON "_media_v" USING btree ("version_sizes_square_filename");
  CREATE INDEX "_media_v_version_sizes_small_version_sizes_small_filenam_idx" ON "_media_v" USING btree ("version_sizes_small_filename");
  CREATE INDEX "_media_v_version_sizes_medium_version_sizes_medium_filen_idx" ON "_media_v" USING btree ("version_sizes_medium_filename");
  CREATE INDEX "_media_v_version_sizes_large_version_sizes_large_filenam_idx" ON "_media_v" USING btree ("version_sizes_large_filename");
  CREATE INDEX "_media_v_version_sizes_xlarge_version_sizes_xlarge_filen_idx" ON "_media_v" USING btree ("version_sizes_xlarge_filename");
  CREATE INDEX "_media_v_version_sizes_og_version_sizes_og_filename_idx" ON "_media_v" USING btree ("version_sizes_og_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "_categories_v_version_breadcrumbs_order_idx" ON "_categories_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX "_categories_v_version_breadcrumbs_parent_id_idx" ON "_categories_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_version_breadcrumbs_doc_idx" ON "_categories_v_version_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_parent_idx" ON "_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("folders_id");
  CREATE INDEX "payload_locked_documents_rels_ai_tasks_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_tasks_id");
  CREATE INDEX "payload_locked_documents_rels_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("chapters_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX "payload_locked_documents_rels_favorites_id_idx" ON "payload_locked_documents_rels" USING btree ("favorites_id");
  CREATE INDEX "payload_locked_documents_rels_reading_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("reading_progress_id");
  CREATE INDEX "payload_locked_documents_rels_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("stories_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_stories_id_idx" ON "header_rels" USING btree ("stories_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_stories_id_idx" ON "footer_rels" USING btree ("stories_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "folders" CASCADE;
  DROP TABLE "_folders_v" CASCADE;
  DROP TABLE "ai_tasks" CASCADE;
  DROP TABLE "ai_tasks_rels" CASCADE;
  DROP TABLE "_ai_tasks_v" CASCADE;
  DROP TABLE "_ai_tasks_v_rels" CASCADE;
  DROP TABLE "chapters" CASCADE;
  DROP TABLE "_chapters_v" CASCADE;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "_comments_v" CASCADE;
  DROP TABLE "favorites" CASCADE;
  DROP TABLE "_favorites_v" CASCADE;
  DROP TABLE "reading_progress" CASCADE;
  DROP TABLE "_reading_progress_v" CASCADE;
  DROP TABLE "stories_tags" CASCADE;
  DROP TABLE "stories" CASCADE;
  DROP TABLE "_stories_v_version_tags" CASCADE;
  DROP TABLE "_stories_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "_categories_v_version_breadcrumbs" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TYPE "public"."enum_ai_tasks_task_type";
  DROP TYPE "public"."enum_ai_tasks_status";
  DROP TYPE "public"."enum__ai_tasks_v_version_task_type";
  DROP TYPE "public"."enum__ai_tasks_v_version_status";
  DROP TYPE "public"."enum_chapters_status";
  DROP TYPE "public"."enum__chapters_v_version_status";
  DROP TYPE "public"."enum_comments_status";
  DROP TYPE "public"."enum__comments_v_version_status";
  DROP TYPE "public"."enum_stories_content_status";
  DROP TYPE "public"."enum__stories_v_version_content_status";
  DROP TYPE "public"."enum_media_media_type";
  DROP TYPE "public"."enum_media_rights_status";
  DROP TYPE "public"."enum_media_provider";
  DROP TYPE "public"."enum__media_v_version_media_type";
  DROP TYPE "public"."enum__media_v_version_rights_status";
  DROP TYPE "public"."enum__media_v_version_provider";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";
  DROP TYPE "public"."enum_site_settings_default_direction";
  DROP TYPE "public"."enum__site_settings_v_version_default_direction";`)
}
