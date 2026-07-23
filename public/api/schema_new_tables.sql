-- ========================================================
-- CameMark MySQL Database Import Script (New Tables)
-- Database: camemark_db
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Bargain Deals Table
CREATE TABLE IF NOT EXISTS `bargain_deals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `originalPrice` DECIMAL(10, 2) NOT NULL,
  `discountPercent` VARCHAR(50) DEFAULT '-20%',
  `imageUrl` TEXT NULL,
  `region` VARCHAR(100) DEFAULT 'Centre (Yaoundé)',
  `sellerName` VARCHAR(255) DEFAULT 'Farmer / Cooperative',
  `isLive` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Bargain Deals Data
INSERT INTO `bargain_deals` (`id`, `title`, `price`, `originalPrice`, `discountPercent`, `imageUrl`, `region`, `sellerName`, `isLive`) VALUES
(1, 'Fresh Pineapples (1pc)', 1200.00, 1800.00, '-33%', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80', 'Littoral (Douala)', 'Penja Fruit Producers', 1),
(2, 'Cameroon Peppers (500g)', 800.00, 1200.00, '-33%', 'https://images.unsplash.com/photo-1588879460405-59427f7f4577?auto=format&fit=crop&w=400&q=80', 'West (Bafoussam)', 'Highland Farmers Co-op', 1),
(3, 'Dry Okra (250g)', 900.00, 1400.00, '-36%', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80', 'North (Garoua)', 'Northern Grain Network', 1),
(4, 'Plantain Bunch (Grade A)', 2500.00, 3500.00, '-28%', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80', 'Southwest (Buea)', 'Fako Agricultural Alliance', 1),
(5, 'Organic Egusi Seeds (1kg)', 3200.00, 4500.00, '-29%', 'https://images.unsplash.com/photo-1509358271058-acd02cc93858?auto=format&fit=crop&w=400&q=80', 'Centre (Yaoundé)', 'Nyong Organic Hub', 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 2. Referral Settings Table
CREATE TABLE IF NOT EXISTS `referral_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) UNIQUE NOT NULL,
  `setting_value` VARCHAR(255) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Referral Settings (Default 20 FCFA)
INSERT INTO `referral_settings` (`setting_key`, `setting_value`) 
VALUES ('referral_reward_amount', '20')
ON DUPLICATE KEY UPDATE `setting_value` = '20';

-- 3. Referrals Log Table
CREATE TABLE IF NOT EXISTS `referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referrer_id` VARCHAR(100) NOT NULL,
  `referrer_name` VARCHAR(255) NOT NULL,
  `referrer_email` VARCHAR(255) NULL,
  `ref_code` VARCHAR(100) NOT NULL,
  `referred_user_id` VARCHAR(100) NULL,
  `referred_user_name` VARCHAR(255) NULL,
  `referred_user_email` VARCHAR(255) NULL,
  `reward_amount` DECIMAL(10, 2) DEFAULT 20.00,
  `status` VARCHAR(50) DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Sample Referrals
INSERT INTO `referrals` (`referrer_id`, `referrer_name`, `referrer_email`, `ref_code`, `referred_user_name`, `referred_user_email`, `reward_amount`, `status`) VALUES
('user-demo-1', 'Taiwo Taiwo', 'taiwo@camemark.com', 'taiwo', 'Paul Biya', 'paul@camemark.com', 20.00, 'completed'),
('user-demo-1', 'Taiwo Taiwo', 'taiwo@camemark.com', 'taiwo', 'Marie Eto', 'marie@camemark.com', 20.00, 'completed');

-- 4. Products Table (if missing)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'FCFA',
  `rating` DECIMAL(3, 1) DEFAULT 4.8,
  `reviewsCount` INT DEFAULT 12,
  `region` VARCHAR(100) DEFAULT 'Centre (Yaoundé)',
  `sellerName` VARCHAR(255) DEFAULT 'Verified Farmer',
  `imageUrl` TEXT NULL,
  `badge` VARCHAR(100) DEFAULT 'Fresh Harvest',
  `isBargainable` TINYINT(1) DEFAULT 1,
  `stock` INT DEFAULT 50,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
