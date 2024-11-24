import axiosInstance from '@/utils/axiosInstance'
import { notifyError } from '@/services/notification'

export const fetchDatasets = async (quantity : number, topic : string) => {
  try {
    const response = await axiosInstance.get('/datasets', {
      params: {
        quantity,
        topic,
      }
    });

    const datasets = response?.data?.data?.datasets || []
    return datasets.map((item: any) => {
      if (item.avatar) {
        item.avatar = `${item.avatar}`
      }
      return item
    })
  } catch (error) {
    notifyError('Fail to get datasets!')
    console.error('Failed to fetch data:', error)
    return []
  }
}

export const fetchDatasetsDetail = async (datasetId: number) => {
  try {
    const response = await axiosInstance.get(`/datasets/${datasetId}`)
    console.log(response.data)
    return response.data
  } catch (error) {
    notifyError('Failed to load dataset details!')
    console.error('Failed to load dataset details:', error)
  }
}

export const fetchVersionData = async (
  versionId: number,
) => {
  try {
    const response = await axiosInstance.get(
      `/datasets/version/${versionId}`,
    )
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Failed to fetch version data:', error)
  }
}
