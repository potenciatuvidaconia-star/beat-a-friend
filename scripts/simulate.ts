/**
 * Beat-a-Friend · Simulación de datos de prueba
 * ─────────────────────────────────────────────
 * Uso:
 *   npx tsx scripts/simulate.ts seed     → crea datos de prueba
 *   npx tsx scripts/simulate.ts cleanup  → borra todo lo de prueba
 *
 * Requiere las env vars de .env.local (se cargan automáticamente).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── cargar .env.local manualmente ──────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    for (const line of raw.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) process.env[match[1].trim()] = match[2].trim()
    }
  } catch { /* ya están en el ambiente */ }
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Marcadores para identificar datos de prueba ──────────────────
const TEST_EMAIL_DOMAIN = '@beatafriend.demo'
const TEST_GROUP_CODE   = 'DEMO2026'

// ── Participantes simulados ──────────────────────────────────────
const DEMO_USERS = [
  { email: `carlos${TEST_EMAIL_DOMAIN}`,  name: 'Carlos Reyes',   points: 85 },
  { email: `maria${TEST_EMAIL_DOMAIN}`,   name: 'María López',    points: 72 },
  { email: `juan${TEST_EMAIL_DOMAIN}`,    name: 'Juan Martínez',  points: 68 },
  { email: `ana${TEST_EMAIL_DOMAIN}`,     name: 'Ana Torres',     points: 55 },
  { email: `pedro${TEST_EMAIL_DOMAIN}`,   name: 'Pedro Sánchez',  points: 43 },
  { email: `laura${TEST_EMAIL_DOMAIN}`,   name: 'Laura Gómez',    points: 22 },
]

const CHAT_MESSAGES = [
  (u: typeof DEMO_USERS) => ({ uid: u[0].id, msg: '¡Que empiece el Mundial! 🔥' }),
  (u: typeof DEMO_USERS) => ({ uid: u[1].id, msg: 'Este año gana Argentina, lo sé 🇦🇷' }),
  (u: typeof DEMO_USERS) => ({ uid: u[2].id, msg: 'Jajaja ojalá… yo voy con Brasil 🇧🇷' }),
  (u: typeof DEMO_USERS) => ({ uid: u[3].id, msg: 'Pedro lleva 3 semanas en el sótano, qué vergüenza 😂' }),
  (u: typeof DEMO_USERS) => ({ uid: u[4].id, msg: 'Ya verán cuando arranque el torneo…' }),
  (u: typeof DEMO_USERS) => ({ uid: u[5].id, msg: '¡El que quede último paga la pizza del partido final! 🍕' }),
  (u: typeof DEMO_USERS) => ({ uid: u[0].id, msg: 'María va segunda, no se cree 👀' }),
  (u: typeof DEMO_USERS) => ({ uid: u[1].id, msg: '¡Que me quiten lo bailado!' }),
]

// ── SEED ─────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱  Creando datos de prueba...\n')

  // 1. Crear usuarios en auth
  const createdUsers: Array<typeof DEMO_USERS[0] & { id: string }> = []
  for (const u of DEMO_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: 'Demo123456!',
      user_metadata: { display_name: u.name },
      email_confirm: true,
    })
    if (error) {
      console.warn(`  ⚠️  ${u.name} (${u.email}): ${error.message}`)
      // Si ya existe, obtener su id
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', u.email)
        .single()
      if (existing) createdUsers.push({ ...u, id: existing.id })
    } else {
      console.log(`  ✅  Usuario creado: ${u.name}`)
      createdUsers.push({ ...u, id: data.user.id })
    }
  }

  if (createdUsers.length === 0) {
    console.error('❌  No se pudo crear ningún usuario.')
    return
  }

  // 2. El trigger crea los profiles automáticamente; actualizamos display_name
  for (const u of createdUsers) {
    await supabase.from('profiles').update({ display_name: u.name }).eq('id', u.id)
  }
  console.log('\n  👤  Perfiles actualizados')

  // 3. Crear grupo demo (owner = Carlos)
  const owner = createdUsers[0]
  const { data: group, error: gErr } = await supabase.from('groups').insert({
    name: '🧪 Demo — Los Amigos del Mundial',
    code: TEST_GROUP_CODE,
    mode: 'basic',
    owner_id: owner.id,
    yappy_number: '507-0000-0000',
    apodo_primero: 'El Adivino',
    apodo_ultimo: 'El Ciego Demo',
    premio_castigo: 'El último paga la pizza del partido final 🍕',
  }).select().single()

  if (gErr || !group) {
    console.error('❌  Error creando grupo:', gErr?.message)
    return
  }
  console.log(`  🏆  Grupo creado: "${group.name}" (código: ${group.code})`)

  // 4. Agregar miembros con puntos distintos
  for (const u of createdUsers) {
    const { error } = await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: u.id,
      status: 'active',
      payment_status: 'confirmed',
      points: u.points,
    })
    if (error) console.warn(`  ⚠️  No se pudo agregar ${u.name}: ${error.message}`)
    else console.log(`  👥  ${u.name} → ${u.points} pts`)
  }

  // 5. Buscar partidos finalizados para crear predicciones
  const { data: finishedMatches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, home_score, away_score, match_date')
    .eq('status', 'finished')
    .limit(10)

  if (finishedMatches && finishedMatches.length > 0) {
    console.log(`\n  ⚽  Creando predicciones sobre ${finishedMatches.length} partidos finalizados...`)
    const OPTIONS = ['1', 'X', '2'] as const

    // Distribución de aciertos para simular ranking creíble
    // Carlos (1°): acierta mucho · Laura (último): acierta poco
    const HIT_RATES = [0.8, 0.65, 0.6, 0.45, 0.35, 0.2]

    for (let ui = 0; ui < createdUsers.length; ui++) {
      const u = createdUsers[ui]
      const hitRate = HIT_RATES[ui]

      for (const m of finishedMatches) {
        const actual =
          m.home_score > m.away_score ? '1' :
          m.home_score < m.away_score ? '2' : 'X'

        const pred = Math.random() < hitRate
          ? actual                                          // acierto
          : OPTIONS.filter(o => o !== actual)[Math.floor(Math.random() * 2)] // fallo

        const pts = pred === actual ? 3 : 0

        await supabase.from('predictions').insert({
          user_id: u.id,
          group_id: group.id,
          match_id: m.id,
          prediction: pred,
          points_earned: pts,
        })
      }
    }
    console.log('  ✅  Predicciones creadas')
  } else {
    console.log('\n  ℹ️  No hay partidos finalizados aún — predicciones omitidas')
  }

  // 6. Mensajes de chat
  console.log('\n  💬  Agregando mensajes de chat...')
  for (const msgFn of CHAT_MESSAGES) {
    const { uid, msg } = msgFn(createdUsers as any)
    await supabase.from('group_messages').insert({
      group_id: group.id,
      user_id: uid,
      content: msg,
    })
  }

  console.log(`
╔══════════════════════════════════════════════════════╗
║  ✅  DEMO LISTO                                      ║
╠══════════════════════════════════════════════════════╣
║  Código de grupo: ${TEST_GROUP_CODE.padEnd(34)}║
║  URL: /unirse/${TEST_GROUP_CODE.padEnd(38)}║
╠══════════════════════════════════════════════════════╣
║  USUARIOS DE PRUEBA (pass: Demo123456!)             ║`)
  for (const u of createdUsers) {
    console.log(`║  ${u.email.padEnd(52)}║`)
  }
  console.log(`╠══════════════════════════════════════════════════════╣
║  Para limpiar: npx tsx scripts/simulate.ts cleanup  ║
╚══════════════════════════════════════════════════════╝
`)
}

// ── CLEANUP ──────────────────────────────────────────────────────
async function cleanup() {
  console.log('\n🧹  Limpiando datos de prueba...\n')

  // Buscar usuarios de prueba por dominio de email
  const { data: demoProfiles } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .like('email', `%${TEST_EMAIL_DOMAIN}`)

  const demoIds = (demoProfiles ?? []).map(p => p.id)
  console.log(`  Usuarios demo encontrados: ${demoIds.length}`)
  for (const p of demoProfiles ?? []) {
    console.log(`  · ${p.display_name} (${p.email})`)
  }

  if (demoIds.length === 0 && !await groupExists()) {
    console.log('\n  ℹ️  No hay datos de prueba que limpiar.')
    return
  }

  // Buscar grupo demo
  const { data: demoGroup } = await supabase
    .from('groups')
    .select('id, name')
    .eq('code', TEST_GROUP_CODE)
    .single()

  if (demoGroup) {
    const gid = demoGroup.id
    console.log(`\n  Grupo: "${demoGroup.name}"`)

    // Borrar en orden de dependencias
    const { count: msgCount } = await supabase
      .from('group_messages').delete().eq('group_id', gid).select('id', { count: 'exact', head: true })
    console.log(`  · ${msgCount ?? 0} mensajes de chat borrados`)

    const { count: predCount } = await supabase
      .from('predictions').delete().eq('group_id', gid).select('id', { count: 'exact', head: true })
    console.log(`  · ${predCount ?? 0} predicciones borradas`)

    const { count: membCount } = await supabase
      .from('group_members').delete().eq('group_id', gid).select('id', { count: 'exact', head: true })
    console.log(`  · ${membCount ?? 0} membresías borradas`)

    await supabase.from('groups').delete().eq('id', gid)
    console.log('  · Grupo borrado')
  }

  // Borrar usuarios auth (cascada borra profiles)
  let deleted = 0
  for (const id of demoIds) {
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (!error) deleted++
    else console.warn(`  ⚠️  No se pudo borrar usuario ${id}: ${error.message}`)
  }
  console.log(`  · ${deleted} usuarios de auth borrados (+ sus perfiles por cascada)`)

  console.log('\n  ✅  Base de datos limpia. No quedó rastro del demo.\n')
}

async function groupExists(): Promise<boolean> {
  const { data } = await supabase.from('groups').select('id').eq('code', TEST_GROUP_CODE).single()
  return !!data
}

// ── Entrypoint ───────────────────────────────────────────────────
const cmd = process.argv[2]
if (cmd === 'seed') {
  seed().catch(console.error)
} else if (cmd === 'cleanup') {
  cleanup().catch(console.error)
} else {
  console.log(`
Beat-a-Friend · Simulación de datos

  npx tsx scripts/simulate.ts seed     → crear 6 usuarios demo + grupo + predicciones
  npx tsx scripts/simulate.ts cleanup  → borrar todo lo creado
`)
}
