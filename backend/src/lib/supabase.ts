import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // On avertit sans crasher pour permettre de démarrer le serveur avant
  // d'avoir configuré Supabase. Les routes qui l'utilisent échoueront tant
  // que le .env n'est pas rempli.
  console.warn(
    '[supabase] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env — ' +
      'le client Supabase ne fonctionnera pas tant que ce n\'est pas configuré.'
  );
}

// Client admin (service_role) : à utiliser uniquement côté serveur.
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseServiceRoleKey ?? ''
);
