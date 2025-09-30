-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: charityevents_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (4,'Concert'),(2,'Fun Run'),(1,'Gala Dinner'),(3,'Silent Auction'),(5,'Workshop');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  `category_id` int DEFAULT NULL,
  `ticket_price` decimal(10,2) DEFAULT '0.00',
  `goal_amount` decimal(10,2) NOT NULL,
  `current_amount` decimal(10,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Starlight Charity Gala','An elegant dinner event to raise funds for children education, featuring speeches, performances, and raffle draws.','2025-10-15 19:00:00','Sydney Town Hall',1,150.00,50000.00,32000.00,1,'2025-09-30 18:44:27'),(2,'Hope Fun Run 2025','5km fun run event to raise funds for cancer research. Participants of all ages are welcome!','2025-09-20 08:00:00','Centennial Park',2,25.00,20000.00,12500.00,1,'2025-09-30 18:44:27'),(3,'Autumn Silent Auction','Showcasing local artists works through silent auction to support community art development.','2025-11-05 18:30:00','Art Center Gallery',3,0.00,15000.00,8000.00,1,'2025-09-30 18:44:27'),(4,'Healing Voices Concert','Local bands performing together to raise funds for mental health organizations.','2025-10-28 20:00:00','City Concert Hall',4,40.00,30000.00,18000.00,1,'2025-09-30 18:44:27'),(5,'Eco Awareness Workshop','Learn sustainable living skills, all proceeds go to environmental protection projects.','2025-09-30 10:00:00','Community Center',5,15.00,8000.00,4500.00,1,'2025-09-30 18:44:27'),(6,'Winter Charity Ball','Dance the night away to raise funds for homeless shelters.','2025-12-10 21:00:00','Royal Ballroom',1,120.00,45000.00,22000.00,1,'2025-09-30 18:44:27'),(7,'Animal Rescue Fundraiser','Support local animal shelters and rescue organizations through this special charity event.','2025-11-15 18:00:00','City Convention Center',1,75.00,25000.00,12000.00,1,'2025-09-30 18:44:27'),(8,'Community Food Drive','Help collect and distribute food to families in need across our community.','2025-10-25 09:00:00','Central Plaza',5,0.00,10000.00,5500.00,1,'2025-09-30 18:44:27');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-01  2:50:13
