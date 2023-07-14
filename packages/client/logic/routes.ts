import type { RouteLocationNormalized, RouteRecordName, RouteRecordNormalized, RouteRecordRaw, Router } from 'vue-router'
import { createRouterMatcher } from 'vue-router'
import { timelineApi } from './timeline'
import { router } from './app'

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

// const PINK_500 = 0xEC4899
// const BLUE_600 = 0x2563EB
// const LIME_500 = 0x84CC16
const CYAN_400 = 0x22D3EE
const ORANGE_400 = 0xFB923C
// const GRAY_100 = 0xf4f4f5
const GRAY_300 = 0xC4C4C4

const LAYER_ID = 'router'
// export const router = ref<Router>()
export const routeRecordMatcher = ref<RouteRecordMatcher[]>()
export const activeRouteRecordIndex = ref(0)
let routeRecordMatcherStateMap = new Map()
export function isRouteName(name: any): name is RouteRecordName {
  return typeof name === 'string' || typeof name === 'symbol'
}
export const routeRecordMatcherState = computed(() => {
  return routeRecordMatcher.value?.map((route) => {
    const state = formatRouteRecordMatcherForStateInspector(route)
    const tags = formatRouteRecordForInspector(route)
    return {
      path: state.path,
      tags,
      state,
    }
  }).sort((a, b) => a.path!.length - b.path!.length).filter(i => !routeRecordMatcherStateMap.has(i.path) && routeRecordMatcherStateMap.set(i.path, 1))
})
export const activeRouteRecordMatcherState = computed(() => {
  const state = routeRecordMatcherState.value?.[activeRouteRecordIndex.value]?.state
  return {
    key: 'options',
    value: state!,
  }
})

// function modifierForKey(key: any) {
//   if (key.optional)
//     return key.repeatable ? '*' : '?'

//   else
//     return key.repeatable ? '+' : ''
// }

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
      bgColor: GRAY_300,
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

function formatRouteLocation(
  routeLocation: RouteLocationNormalized,
) {
  const copy = Object.assign({}, routeLocation, {
    // remove variables that can contain vue instances
    matched: routeLocation.matched.map(matched =>
      reactiveOmit(matched, ['instances', 'children', 'aliasOf']),
    ),
  })

  return copy
}

function subscribeRouterChanged(router: Router) {
  router.onError((error, to) => {
    timelineApi.addTimelineEvent({
      layerId: LAYER_ID,
      event: {
        title: 'Error during Navigation',
        subtitle: to.fullPath,
        time: Date.now(),
        now: Date.now(),
        data: { error: error.message },
      },
    })
  })

  router.beforeEach((to, from) => {
    const data = {
      guard: 'beforeEach',
      from: formatRouteLocation(
        from,
      ),
      to: formatRouteLocation(to),
    }

    timelineApi.addTimelineEvent({
      layerId: LAYER_ID,
      event: {
        time: Date.now(),
        now: Date.now(),
        title: 'Start of navigation',
        subtitle: to.fullPath,
        data,
      },
    })
  })

  router.afterEach((to, from, failure) => {
    const data: Record<string, unknown> = {
      guard: 'afterEach',
    }

    if (failure) {
      data.failure = failure ? failure.message : ''
      data.status = '❌'
    }
    else {
      data.status = '✅'
    }

    // we set here to have the right order
    data.from = formatRouteLocation(from)
    data.to = formatRouteLocation(to)

    timelineApi.addTimelineEvent({
      layerId: LAYER_ID,
      event: {
        title: 'End of navigation',
        subtitle: to.fullPath,
        time: Date.now(),
        now: Date.now(),
        data,
      },
    })
  })
}

export function initRoutes(buffer: [string, Record<string, any>][]) {
  if (router.value) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const matcher = createRouterMatcher(router.value?.options.routes!, router.value?.options!)
    routeRecordMatcher.value = matcher.getRoutes()

    function addRoute(
      parentOrRoute: RouteRecordName | RouteRecordRaw,
      route?: RouteRecordRaw,
    ) {
      let parent: Parameters<(typeof matcher)['addRoute']>[1] | undefined
      let record: RouteRecordRaw
      if (isRouteName(parentOrRoute)) {
        parent = matcher.getRecordMatcher(parentOrRoute)
        record = route!
      }
      else {
        record = parentOrRoute
      }

      return matcher.addRoute(record, parent)
    }

    function removeRoute(name: RouteRecordName) {
      const recordMatcher = matcher.getRecordMatcher(name)
      if (recordMatcher)
        matcher.removeRoute(recordMatcher)
    }

    function updateRecordMatcher() {
      triggerRef(router)
      routeRecordMatcherStateMap = new Map()
      routeRecordMatcher.value = matcher.getRoutes()
      triggerRef(routeRecordMatcher)
      activeRouteRecordIndex.value = 0
    }

    buffer.forEach(([type, payload]) => {
      // @ts-expect-error missing types
      type === 'router:add-route' ? addRoute(...payload.args) : removeRoute(...payload.args)
      updateRecordMatcher()
    })

    // addRoute overrides (find a better way to inspect it)
    const _addRoute = router.value.addRoute
    router.value.addRoute = (...args) => {
      // @ts-expect-error missing types
      const res = _addRoute(...args)
      // @ts-expect-error missing types
      addRoute(...args)
      updateRecordMatcher()
      return res
    }

    // removeRoute overrides (find a better way to inspect it)
    const _removeRoute = router.value.removeRoute
    router.value.removeRoute = (...args) => {
      const res = _removeRoute(...args)
      removeRoute(...args)
      updateRecordMatcher()
      return res
    }

    timelineApi.addTimelineLayer({
      id: LAYER_ID,
      label: 'Router Navigations',
    })
    subscribeRouterChanged(router.value)
  }
}
