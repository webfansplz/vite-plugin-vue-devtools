import type { RouteRecordNormalized, Router } from 'vue-router'
import { createRouterMatcher } from 'vue-router'

type RouteRecordMatcher = ReturnType<ReturnType<typeof createRouterMatcher>['getRoutes']>[0]

type RouteRecordFields = Partial<{
  path: RouteRecordNormalized['path']
  name: RouteRecordNormalized['name']
  regexp: RouteRecordMatcher['re']
  keys: RouteRecordMatcher['keys']
  redirect: RouteRecordNormalized['redirect']
  aliases: string[]
  meta: RouteRecordNormalized['meta']
  score: RouteRecordMatcher['score']
}>

type RouteRecordTags = {
  label: string
  bgColor: number
}[]

const PINK_500 = 0xEC4899
const BLUE_600 = 0x2563EB
const LIME_500 = 0x84CC16
const CYAN_400 = 0x22D3EE
const ORANGE_400 = 0xFB923C
// const GRAY_100 = 0xf4f4f5
const DARK = 0x666666

export const router = ref<Router>()
export const routeRecordMatcher = ref<RouteRecordMatcher[]>()
export const activeRouteRecordIndex = ref(0)
export const routeRecordMatcherState = computed(() => {
  return routeRecordMatcher.value?.map((route) => {
    const state = formatRouteRecordMatcherForStateInspector(route)
    const tags = formatRouteRecordForInspector(route)
    return {
      path: state.path,
      tags,
      state,
    }
  }).sort((a, b) => a.path!.length - b.path!.length)
})
export const activeRouteRecordMatcherState = computed(() => {
  const state = routeRecordMatcherState.value?.[activeRouteRecordIndex.value]?.state
  return {
    key: 'options',
    value: state,
  }
})

function modifierForKey(key: any) {
  if (key.optional)
    return key.repeatable ? '*' : '?'

  else
    return key.repeatable ? '+' : ''
}

function formatRouteRecordForInspector(
  route: RouteRecordMatcher,
): RouteRecordTags {
  const tags: RouteRecordTags = []
  const { record } = route

  if (record.name != null) {
    tags.push({
      label: String(record.name),
      bgColor: CYAN_400,
    })
  }

  if (record.aliasOf) {
    tags.push({
      label: 'alias',
      bgColor: ORANGE_400,
    })
  }

  // TODO: implement this
  // if ((route as any).__vd_match) {
  //   tags.push({
  //     label: 'matches',
  //     bgColor: PINK_500,
  //   })
  // }

  // if ((route as any).__vd_exactActive) {
  //   tags.push({
  //     label: 'exact',
  //     bgColor: LIME_500,
  //   })
  // }

  // if ((route as any).__vd_active) {
  //   tags.push({
  //     label: 'active',
  //     bgColor: BLUE_600,
  //   })
  // }

  if (record.redirect) {
    tags.push({
      label:
        typeof record.redirect === 'string'
          ? `redirect: ${record.redirect}`
          : 'redirects',
      bgColor: DARK,
    })
  }

  return tags
}

function formatRouteRecordMatcherForStateInspector(
  route: RouteRecordMatcher,
): RouteRecordFields {
  const { record } = route
  const fields: RouteRecordFields = {
    path: record.path,
  }

  if (record.name != null)
    fields.name = record.name

  fields.regexp = route.re

  if (route.keys.length)
    fields.keys = toRaw(route.keys)

  if (record.redirect != null)
    fields.redirect = record.redirect

  if (route.alias.length)
    fields.aliases = route.alias.map(alias => alias.record.path)

  if (Object.keys(route.record.meta).length)
    fields.meta = route.record.meta

  fields.score = toRaw(route.score)

  return fields
}

export function toggleRouteRecordMatcher(index: number) {
  activeRouteRecordIndex.value = index
}

export function initRoutes() {
  const app = window.parent.__VUE_DEVTOOLS_GET_VUE_APP__()
  router.value = app.config.globalProperties.$router
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const matcher = createRouterMatcher(router.value?.options.routes!, router.value?.options!)
  routeRecordMatcher.value = matcher.getRoutes()
  // consola(formatRouteRecordMatcherForStateInspector(routes?.[0]))
  // Update router Manually
  router.value?.afterEach(() => {
    triggerRef(router)
  })
}
