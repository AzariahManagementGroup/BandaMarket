-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: camemark_db
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('e5b52275-a82e-489b-8c3d-d82de331fccf','4ac2796edd074f71956c553d6b6eaa0d5ccd4b596c8094095195da338b4bdebe','2026-07-22 07:29:40.883','20260722072939_init',NULL,NULL,'2026-07-22 07:29:39.905',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bargains`
--

DROP TABLE IF EXISTS `bargains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bargains` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sellerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `offeredPrice` double NOT NULL,
  `status` enum('pending','accepted','rejected','countered') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `counterPrice` double DEFAULT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bargains_listingId_fkey` (`listingId`),
  KEY `bargains_buyerId_fkey` (`buyerId`),
  KEY `bargains_sellerId_fkey` (`sellerId`),
  CONSTRAINT `bargains_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `bargains_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bargains_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bargains`
--

LOCK TABLES `bargains` WRITE;
/*!40000 ALTER TABLE `bargains` DISABLE KEYS */;
/*!40000 ALTER TABLE `bargains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_key` (`name`),
  UNIQUE KEY `categories_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_enrollments`
--

DROP TABLE IF EXISTS `course_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `card_transactions` (
  `id` varchar(100) NOT NULL,
  `cardId` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'XAF',
  `merchant` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'completed',
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cardId`) REFERENCES `cards`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` varchar(100) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `cardId` varchar(100) DEFAULT NULL,
  `transactionId` varchar(100) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `adminResponse` text DEFAULT NULL,
  `status` enum('open','resolved') DEFAULT 'open',
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `course_enrollments` (
  `id` varchar(100) NOT NULL,
  `courseId` varchar(100) NOT NULL,
  `courseTitle` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `paymentStatus` varchar(50) DEFAULT 'free',
  `amountPaid` varchar(100) DEFAULT '0 FCFA',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_enrollments`
--

LOCK TABLES `course_enrollments` WRITE;
/*!40000 ALTER TABLE `course_enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT 'business',
  `instructor` varchar(255) DEFAULT 'Camer Market Academy Instructor',
  `level` varchar(50) DEFAULT 'All Levels',
  `duration` varchar(50) DEFAULT '4 Weeks',
  `price` varchar(100) DEFAULT 'Free Access',
  `image` text NOT NULL,
  `description` text,
  `videoUrl` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_fees`
--

DROP TABLE IF EXISTS `delivery_fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_fees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `standardFee` decimal(10,2) DEFAULT '1000.00',
  `expressFee` decimal(10,2) DEFAULT '2500.00',
  `pickupFee` decimal(10,2) DEFAULT '0.00',
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_fees`
--

LOCK TABLES `delivery_fees` WRITE;
/*!40000 ALTER TABLE `delivery_fees` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc_verifications`
--

DROP TABLE IF EXISTS `kyc_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kyc_verifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `documentType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `documentNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `documentUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected','not_submitted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rejectionReason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kyc_verifications_userId_key` (`userId`),
  CONSTRAINT `kyc_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc_verifications`
--

LOCK TABLES `kyc_verifications` WRITE;
/*!40000 ALTER TABLE `kyc_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `kyc_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listings`
--

DROP TABLE IF EXISTS `listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `quantity` int NOT NULL DEFAULT '1',
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `region` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','draft','sold','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `images` json DEFAULT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sellerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listings_categoryId_fkey` (`categoryId`),
  KEY `listings_sellerId_fkey` (`sellerId`),
  CONSTRAINT `listings_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `listings_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listings`
--

LOCK TABLES `listings` WRITE;
/*!40000 ALTER TABLE `listings` DISABLE KEYS */;
/*!40000 ALTER TABLE `listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sellerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `totalPrice` double NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `status` enum('pending','confirmed','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `shippingCity` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippingAddr` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  KEY `orders_listingId_fkey` (`listingId`),
  KEY `orders_buyerId_fkey` (`buyerId`),
  KEY `orders_sellerId_fkey` (`sellerId`),
  CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orders_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `listings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orders_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `sellerId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'XAF',
  `quantity` int DEFAULT '1',
  `unit` varchar(50) DEFAULT 'pcs',
  `category` varchar(100) DEFAULT 'Agriculture & Produce',
  `region` varchar(50) DEFAULT 'Littoral',
  `city` varchar(100) DEFAULT 'Douala',
  `imageUrl` longtext,
  `status` varchar(20) DEFAULT 'active',
  `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sellerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `reviews_listingId_fkey` (`listingId`),
  KEY `reviews_reviewerId_fkey` (`reviewerId`),
  KEY `reviews_sellerId_fkey` (`sellerId`),
  CONSTRAINT `reviews_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `reviews_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smtp_settings`
--

DROP TABLE IF EXISTS `smtp_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `smtp_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `smtpHost` varchar(255) DEFAULT NULL,
  `smtpPort` varchar(10) DEFAULT NULL,
  `smtpUser` varchar(255) DEFAULT NULL,
  `smtpPass` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smtp_settings`
--

LOCK TABLES `smtp_settings` WRITE;
/*!40000 ALTER TABLE `smtp_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `smtp_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cameroon',
  `region` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('buyer','seller','farmer','service','logistics','diaspora','org','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'buyer',
  `referralCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `preferredCurrency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `avatarUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kycStatus` enum('pending','approved','rejected','not_submitted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_submitted',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `lastDeviceHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otpCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otpExpiresAt` datetime(3) DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('28775d7c-fe6a-4e75-bd2c-162bfe8ed271','taiwodele88@gmail.com','$2b$10$p3LOmjMPT4y4h9e1uOEpsOMxJG7alP4.mlkm2n6K3tuJVpie8lydC','taiwo taiwo','+2349054755699','Nigeria','Abuja','Abuja','buyer','','en','NGN',NULL,'not_submitted','2026-07-22 07:42:50.503','2026-07-22 07:42:50.503',NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` double NOT NULL DEFAULT '0',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_userId_key` (`userId`),
  CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES ('8e93ec1c-95e9-4a1f-9442-8c05aca0d7b9','28775d7c-fe6a-4e75-bd2c-162bfe8ed271',0,'NGN','2026-07-22 07:42:50.503');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  KEY `orders_listingId_fkey` (`listingId`),
  KEY `orders_buyerId_fkey` (`buyerId`),
  KEY `orders_sellerId_fkey` (`sellerId`),
  CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orders_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `listings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orders_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `sellerId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'XAF',
  `quantity` int DEFAULT '1',
  `unit` varchar(50) DEFAULT 'pcs',
  `category` varchar(100) DEFAULT 'Agriculture & Produce',
  `region` varchar(50) DEFAULT 'Littoral',
  `city` varchar(100) DEFAULT 'Douala',
  `imageUrl` longtext,
  `status` varchar(20) DEFAULT 'active',
  `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `listingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sellerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `reviews_listingId_fkey` (`listingId`),
  KEY `reviews_reviewerId_fkey` (`reviewerId`),
  KEY `reviews_sellerId_fkey` (`sellerId`),
  CONSTRAINT `reviews_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `reviews_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smtp_settings`
--

DROP TABLE IF EXISTS `smtp_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `smtp_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `smtpHost` varchar(255) DEFAULT NULL,
  `smtpPort` varchar(10) DEFAULT NULL,
  `smtpUser` varchar(255) DEFAULT NULL,
  `smtpPass` varchar(255) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smtp_settings`
--

LOCK TABLES `smtp_settings` WRITE;
/*!40000 ALTER TABLE `smtp_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `smtp_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cameroon',
  `region` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('buyer','seller','farmer','service','logistics','diaspora','org','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'buyer',
  `referralCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `preferredCurrency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `avatarUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kycStatus` enum('pending','approved','rejected','not_submitted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_submitted',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `lastDeviceHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otpCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otpExpiresAt` datetime(3) DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('28775d7c-fe6a-4e75-bd2c-162bfe8ed271','taiwodele88@gmail.com','$2b$10$p3LOmjMPT4y4h9e1uOEpsOMxJG7alP4.mlkm2n6K3tuJVpie8lydC','taiwo taiwo','+2349054755699','Nigeria','Abuja','Abuja','buyer','','en','NGN',NULL,'not_submitted','2026-07-22 07:42:50.503','2026-07-22 07:42:50.503',NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` double NOT NULL DEFAULT '0',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_userId_key` (`userId`),
  CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES ('8e93ec1c-95e9-4a1f-9442-8c05aca0d7b9','28775d7c-fe6a-4e75-bd2c-162bfe8ed271',0,'NGN','2026-07-22 07:42:50.503');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-22 19:04:24

CREATE TABLE `login_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('deposit', 'withdrawal', 'transfer', 'payment', 'refund') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'payment',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `status` enum('pending', 'completed', 'failed', 'cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
