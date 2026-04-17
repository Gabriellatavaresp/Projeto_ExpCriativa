SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema AuroraStreaming
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `AuroraStreaming` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `AuroraStreaming` ;

-- -----------------------------------------------------
-- Table `AuroraStreaming`.`artista`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`artista` (
  `id_artista` INT NOT NULL AUTO_INCREMENT,
  `nome_artista` VARCHAR(150) NOT NULL,
  `genero` VARCHAR(50) NULL DEFAULT NULL,
  `foto` LONGBLOB NULL DEFAULT NULL,
  PRIMARY KEY (`id_artista`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `AuroraStreaming`.`album`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`album` (
  `id_album` INT NOT NULL AUTO_INCREMENT,
  `nome_album` VARCHAR(200) NOT NULL,
  `data_lancamento` DATE NULL DEFAULT NULL,
  `capa` LONGBLOB NULL DEFAULT NULL,
  `id_artista` INT NOT NULL,
  PRIMARY KEY (`id_album`),
  INDEX `id_artista` (`id_artista` ASC) VISIBLE,
  CONSTRAINT `album_ibfk_1`
    FOREIGN KEY (`id_artista`)
    REFERENCES `AuroraStreaming`.`artista` (`id_artista`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `AuroraStreaming`.`musica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`musica` (
  `id_musica` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(200) NOT NULL,
  `duracao` TIME NULL DEFAULT NULL,
  `genero` VARCHAR(50) NULL DEFAULT NULL,
  `id_artista` INT NOT NULL,
  `id_album` INT NOT NULL,
  PRIMARY KEY (`id_musica`),
  INDEX `id_artista` (`id_artista` ASC) VISIBLE,
  INDEX `id_album` (`id_album` ASC) VISIBLE,
  CONSTRAINT `musica_ibfk_1`
    FOREIGN KEY (`id_artista`)
    REFERENCES `AuroraStreaming`.`artista` (`id_artista`),
  CONSTRAINT `musica_ibfk_2`
    FOREIGN KEY (`id_album`)
    REFERENCES `AuroraStreaming`.`album` (`id_album`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `AuroraStreaming`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `foto_perfil` LONGBLOB NULL DEFAULT NULL,
  `ativo` TINYINT(1) NULL DEFAULT '1',
  `is_admin` TINYINT(1) NULL DEFAULT '0',
  `cpf` VARCHAR(14) NULL DEFAULT NULL,
  `data_criacao` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE,
  UNIQUE INDEX `cpf` (`cpf` ASC) VISIBLE,
  UNIQUE INDEX `username` (`username` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `AuroraStreaming`.`playlist`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`playlist` (
  `id_playlist` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(200) NOT NULL,
  `descricao` TEXT NULL DEFAULT NULL,
  `publica` TINYINT(1) NULL DEFAULT '0',
  `capa` LONGBLOB NULL DEFAULT NULL,
  `cor` VARCHAR(7) NULL DEFAULT '#8ab8a8',
  `data_criacao` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_playlist`),
  INDEX `id_usuario` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `playlist_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `AuroraStreaming`.`usuario` (`id_usuario`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `AuroraStreaming`.`playlist_contem_musica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`playlist_contem_musica` (
  `id_playlist` INT NOT NULL,
  `id_musica` INT NOT NULL,
  `posicao` INT NULL DEFAULT 0,
  `data_adicionada` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_playlist`, `id_musica`),
  INDEX `id_musica` (`id_musica` ASC) VISIBLE,
  CONSTRAINT `playlist_contem_musica_ibfk_1`
    FOREIGN KEY (`id_playlist`)
    REFERENCES `AuroraStreaming`.`playlist` (`id_playlist`)
    ON DELETE CASCADE,
  CONSTRAINT `playlist_contem_musica_ibfk_2`
    FOREIGN KEY (`id_musica`)
    REFERENCES `AuroraStreaming`.`musica` (`id_musica`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `AuroraStreaming`.`curtida`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`curtida` (
  `id_usuario` INT NOT NULL,
  `id_musica` INT NOT NULL,
  `data_curtida` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`, `id_musica`),
  INDEX `id_musica` (`id_musica` ASC) VISIBLE,
  CONSTRAINT `curtida_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `AuroraStreaming`.`usuario` (`id_usuario`)
    ON DELETE CASCADE,
  CONSTRAINT `curtida_ibfk_2`
    FOREIGN KEY (`id_musica`)
    REFERENCES `AuroraStreaming`.`musica` (`id_musica`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `AuroraStreaming`.`historico_reproducao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuroraStreaming`.`historico_reproducao` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `id_musica` INT NOT NULL,
  `data_reproducao` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `id_usuario` (`id_usuario` ASC) VISIBLE,
  INDEX `id_musica` (`id_musica` ASC) VISIBLE,
  CONSTRAINT `historico_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `AuroraStreaming`.`usuario` (`id_usuario`)
    ON DELETE CASCADE,
  CONSTRAINT `historico_ibfk_2`
    FOREIGN KEY (`id_musica`)
    REFERENCES `AuroraStreaming`.`musica` (`id_musica`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
