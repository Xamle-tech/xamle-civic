#!/bin/bash

# ============================================================
# Script d'Installation Initiale du VPS
# Usage: curl -fsSL https://raw.githubusercontent.com/votre-repo/xamle-civic/main/scripts/setup-vps.sh | bash
# Ou: ./scripts/setup-vps.sh
# ============================================================

set -e

echo "🚀 Configuration initiale du VPS pour Xamle Civic..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier que nous sommes root ou avons sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Ce script doit être exécuté en tant que root ou avec sudo${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Mise à jour du système...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}🔧 Installation des dépendances...${NC}"
apt install -y \
    curl \
    git \
    ufw \
    fail2ban \
    htop \
    vim \
    wget \
    ca-certificates \
    gnupg \
    lsb-release

echo -e "${YELLOW}🐳 Installation de Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installé${NC}"
else
    echo -e "${GREEN}✅ Docker déjà installé${NC}"
fi

echo -e "${YELLOW}🐳 Installation de Docker Compose...${NC}"
apt install -y docker-compose-plugin

echo -e "${YELLOW}👤 Création de l'utilisateur 'xamle'...${NC}"
if id "xamle" &>/dev/null; then
    echo -e "${GREEN}✅ Utilisateur 'xamle' existe déjà${NC}"
else
    adduser --disabled-password --gecos "" xamle
    usermod -aG docker xamle
    echo -e "${GREEN}✅ Utilisateur 'xamle' créé${NC}"
fi

echo -e "${YELLOW}🔥 Configuration du firewall (UFW)...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
echo -e "${GREEN}✅ Firewall configuré${NC}"

echo -e "${YELLOW}🛡️ Configuration de Fail2Ban...${NC}"
if [ ! -f /etc/fail2ban/jail.local ]; then
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    echo -e "${GREEN}✅ Fail2Ban configuré${NC}"
else
    echo -e "${GREEN}✅ Fail2Ban déjà configuré${NC}"
fi

echo -e "${YELLOW}🔐 Configuration SSH sécurisée...${NC}"
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
echo -e "${GREEN}✅ SSH sécurisé${NC}"

echo -e "${YELLOW}📁 Création des répertoires...${NC}"
su - xamle -c "mkdir -p ~/backups ~/logs"

echo -e "${YELLOW}⏰ Configuration des backups automatiques...${NC}"
cat > /etc/cron.d/xamle-backup << 'EOF'
# Backup quotidien de la base de données à 2h du matin
0 2 * * * xamle cd ~/xamle-civic && docker compose -f docker-compose.vps.yml exec -T postgres pg_dump -U \$POSTGRES_USER \$POSTGRES_DB > ~/backups/backup_\$(date +\%Y\%m\%d).sql 2>> ~/logs/backup.log

# Nettoyage des backups de plus de 30 jours
0 3 * * * xamle find ~/backups -name "backup_*.sql" -mtime +30 -delete
EOF
echo -e "${GREEN}✅ Backups automatiques configurés${NC}"

echo -e "${YELLOW}🔍 Vérification des installations...${NC}"
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"

echo ""
echo -e "${GREEN}✅ Configuration du VPS terminée avec succès !${NC}"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Configurez vos clés SSH pour l'utilisateur 'xamle'"
echo "  2. Clonez le repository: su - xamle && git clone https://github.com/votre-repo/xamle-civic.git"
echo "  3. Configurez .env.production"
echo "  4. Obtenez un certificat SSL"
echo "  5. Déployez avec: ./scripts/deploy-vps.sh"
echo ""
echo "🔒 IMPORTANT: Configurez vos clés SSH avant de vous déconnecter !"
echo "   ssh-copy-id xamle@votre-vps-ip"
