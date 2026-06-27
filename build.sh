#!/bin/bash
cat > config.js << EOF
// config.js generado dinámicamente en build time
const SUPABASE_CONFIG = {
  url: "${SUPABASE_URL}",
  key: "${SUPABASE_ANON_KEY}"
};
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
EOF
echo "config.js generado exitosamente"
