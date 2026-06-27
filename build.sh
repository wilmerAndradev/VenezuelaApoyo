#!/bin/bash
cat > config.js << EOF
const SUPABASE_CONFIG = {
  url: '$SUPABASE_URL',
  key: '$SUPABASE_ANON_KEY'
};
EOF
echo "config.js generado exitosamente"
