import axios from "axios"
const axiosInstance = axios.create()
const baseURL = import.meta.env.VITE_ENVIROMENT === "production" ? import.meta.env.VITE_SERVER : import.meta.env.VITE_DEV_SERVER
import { useAppStore } from "@/store/app"

interface IOptions {
  ms?: number;
  msg?: string;
}

interface ITopts {
  clear?: boolean;
  headers?: any;
}

const timeoutWatcher = (promise: Promise<any>, options?: IOptions) => {
  const ms = options ? options.ms : 90000
  const msg = options ? options.msg : "The API request has timed out."
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(msg))
    }, ms)
  })

  return Promise.race([promise, timeout])
}

function addAuthHeader(opts: ITopts = {}) {
  let token: string | null = ""

  token = import.meta.env.VITE_TEST_STRAPI_TOKEN

  if (!opts.headers) {
    opts.headers = {}
  }

  if (token) {
    opts.headers.Authorization = `Bearer ${token}`
  } else {
    opts.headers.Authorization = null
  }
  return opts
}

export const makeRequest = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: "bearer " + import.meta.env.VITE_TEST_STRAPI_TOKEN
  }
})

export async function doAPIGet(path: string, params?: any) {
  const appStore = useAppStore()
  appStore.setLoading(true)

  if (path[0] === "/") {
    path = path.slice(1)
  }
  let url = baseURL + path
  if (params && typeof params === "object") {
    let urlparams = ""
    for (const key in params) {
      if (urlparams !== "") {
        urlparams += "&"
      }
      urlparams += key + "=" + encodeURIComponent(JSON.stringify(params))
    }
    url += "?" + urlparams // + '?token=' + this.token
  }

  try {
    const res = await axiosInstance.get(url, addAuthHeader({ clear: false }))
    appStore.setLoading(false)
    return res.data
  } catch (err: any) {
    console.log(err)
    appStore.setLoading(false)
    return err.response.data
  }
}

export function doAPIPost(path: string, params: any) {
  const appStore = useAppStore()
  appStore.setLoading(true)
  const url = baseURL + path

  const apicall = axiosInstance.post(
    url,
    params,
    addAuthHeader({ clear: false })
  )
  return timeoutWatcher(apicall)
    .then((data) => {
      appStore.setLoading(false)
      return data
    })
    .catch((err) => {
      appStore.setLoading(false)
      console.log(err)
      return err.response.data
    })
}

export function doAPIPut(path: string, params: any) {
  const appStore = useAppStore()
  appStore.setLoading(true)
  const url = baseURL + path

  const apicall = axiosInstance.put(
    url,
    params,
    addAuthHeader({ clear: false })
  )
  return timeoutWatcher(apicall)
    .then((data) => {
      appStore.setLoading(false)
      return data
    })
    .catch((err) => {
      appStore.setLoading(false)
      console.log(err)
      return err.response.data
    })
}
