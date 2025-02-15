<template>
  <div class="labeling-detail__container">
    <button class="btn btn--rounded page-link" @click="goBack">
      <el-icon size="20">
        <Back />
      </el-icon>
      <span>Back</span>
    </button>
    <div class="heading">
      <div class="heading--title">
        <h1 class="small-title">Flowers Dataset</h1>
        <div style="display: flex; gap: 15px">
          <div class="el-tag el-tag--primary el-tag--light">
            <h2 class="el-tag__content small-sub-title">Version 1</h2>
          </div>
          <div class="el-tag el-tag--primary el-tag--light">
            <h2 class="small-sub-title">Part {{ id_part }}</h2>
          </div>
        </div>
      </div>

      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalItems"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
        class="labeling-detail-pagination"
      />
    </div>

    <div class="labeling-detail__main" v-if="currentImageData">
      <img :src="currentImageData.base64Image" alt="" class="main-left" />
      <div class="main-right">
        <p class="main-right__title">Choose labels for the picture</p>
        <div class="label-detail__tag">
          <button
            class="btn btn--rounded"
            :class="{ selected: currentImageData.label === label }"
            v-for="label in currentImageData.labels"
            :key="label"
            @click="selectLabel(label)"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <p style="text-align: center; margin-top: 100px; color: #777">
        No more images to label.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { fetchLabelingDetailData, updateLabel } from '@/services/labeling'
import { ElLoading, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const id_user = Number(route.query.id_user) || 1
const id_part = Number(route.query.id_part) || 1

const labelingData = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = 1
let loadingInstance: any = null

onMounted(async () => {
  loadingInstance = ElLoading.service({
    lock: true,
    text: 'Markat is loading 🗿⌛',
    background: 'rgba(0, 0, 0, 0.1)',
  })

  try {
    const response = await fetchLabelingDetailData(id_user, id_part)
    console.log('API response:', response)

    if (
      response &&
      response.data &&
      response.data.datas &&
      response.data.datas.length > 0
    ) {
      labelingData.value = response.data.datas
      totalItems.value = response.data.datas.length
    } else {
      ElMessage.error('No data available.')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    ElMessage.error('Failed to fetch data.')
  } finally {
    if (loadingInstance) {
      loadingInstance.close()
    }
  }
})
const currentImageData = computed(() => {
  return labelingData.value[currentPage.value - 1]
})

function handlePageChange(page: number) {
  currentPage.value = page
}

async function selectLabel(label: string) {
  const imageData = currentImageData.value
  const id_labeler = '1'

  if (imageData) {
    imageData.label = label
    imageData.labelingTime = new Date()

    try {
      loadingInstance = ElLoading.service({
        lock: true,
        text: 'Markat is loading 🗿⌛',
        background: 'rgba(0, 0, 0, 0.2)',
      })

      const result = await updateLabel(imageData._id, id_labeler, label)
      if (result && result.status === 'success') {
        ElMessage.success(`You have selected the label: ${label}`)

        if (currentPage.value < totalItems.value) {
          currentPage.value += 1
        } else {
          ElMessage.info('You have labeled all images.')
        }
      } else {
        ElMessage.error(result?.message || 'Failed to update label.')
      }
    } catch (error) {
      console.error('Error updating label:', error)
      ElMessage.error('An error occurred while updating the label.')
    } finally {
      if (loadingInstance) {
        loadingInstance.close()
      }
    }
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
.labeling-detail__container {
  padding: 20px;
}

.labeling-detail-pagination {
  width: 100%;
  margin-left: 280px;
}

.labeling-detail__container {
  .heading {
    margin-top: 30px;
    display: flex;
    align-items: center;
    justify-content: start;

    &--title {
      width: 250px;
      display: flex;
      align-items: start;
      flex-direction: column;
      gap: 15px;
      margin-left: 100px;
    }

    .small-title {
      font-size: 20px;
      font-weight: 600;
    }

    &--img {
      width: 200px;
      height: auto;
    }
  }

  .small-sub-title {
    font-size: 15px;
  }
}

.labeling-detail__main {
  margin-top: 30px;
  display: flex;
  gap: 20px;
  max-height: calc(100vh - 280px);

  .main-left {
    min-width: 900px;
    border: 1px solid #999;
    border-radius: 10px;
    padding: 20px;
    object-fit: contain;
  }

  .main-right {
    flex: 1;
    border: 1px solid #999;
    border-radius: 10px;
    padding: 20px;

    &__title {
      text-align: center;
      font-weight: 600;
      font-size: 17px;
      margin-bottom: 30px;
    }
  }
}

.label-detail__tag {
  display: flex;
  flex-wrap: wrap;
  height: 100px;
}

.label-detail__tag .selected {
  background-color: #00b000;
  color: white;
  border-color: #007bff;
}
</style>
