const client = require("../config");
const fs = require('fs').promises;
const path = require('path');

const getDatasetAvatar = async (id_dataset) => {
  try {
    const imagePath = path.join(__dirname, '..', 'Package/Datasets/Avatar/avatar' + id_dataset.toString() + '.png');
    const imageBuffer = await fs.readFile(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (err) {
    console.error(`Error reading file ${id_dataset}:`, err);
    return null;
  }
};

const getAllDatasetsDb = async ({ limit, offset }) => {
  const { rows: datasets } = await client.query(
    `SELECT
    d.ID_dataset,
    d.Avatar,
    d.Name_dataset,
    (SELECT COUNT(*) FROM User_click uc WHERE uc.ID_dataset = d.ID_dataset) AS Views,
    d.Voucher,
    df.Data_format AS Data_Format,
    (SELECT COUNT(*) FROM Version v WHERE v.ID_Dataset = d.ID_Dataset) AS Version_Count
    FROM
        Dataset d
    LEFT JOIN
        Version v ON d.ID_Dataset = v.ID_Dataset
    LEFT JOIN
        Data_format df ON d.ID_data_format = df.ID_data_format
    GROUP BY
        d.ID_Dataset, d.Avatar, d.Name_dataset, d.Voucher, df.Data_format
    ORDER BY
        d.ID_Dataset ASC
    OFFSET $1 LIMIT $2;
    `,
    [offset, limit]
  );
  return datasets;
};
const getDatasetbyDatasetIdDb = async (id_dataset) => {
  const { rows: dataset } = await client.query(
    `SELECT
      d.Name_dataset,
      d.Avatar,
      COALESCE(dsr.Description, dbr.Description) AS Description,
      STRING_AGG(t.Tag_name, ', ') AS Tags,
      version_count.total_versions AS versionCount
    FROM
      Dataset d
    LEFT JOIN
      Data_selling_request dsr ON d.ID_dataset = dsr.ID_dataset AND d.Request_type = 'Selling'
    LEFT JOIN
      Data_buying_request dbr ON d.ID_dataset = dbr.ID_dataset AND d.Request_type = 'Buying'
    LEFT JOIN
      Dataset_tag dt ON d.ID_dataset = dt.ID_dataset
    LEFT JOIN
      Tag t ON dt.ID_tag = t.ID_tag
    LEFT JOIN
      (SELECT ID_dataset, COUNT(*) AS total_versions FROM Version GROUP BY ID_dataset) AS version_count
      ON d.ID_dataset = version_count.ID_dataset
    WHERE
      d.ID_dataset = $1
    GROUP BY
      d.Name_dataset, d.Avatar, dsr.Description, dbr.Description, version_count.total_versions;
    `,
    [id_dataset]
  );
  return dataset[0];
};

const createDatasetDb = async ({
  reliability_minimum,
  avatar,
  name_dataset,
  voucher,
  field,
}) => {
  const { rows: datasets } = await client.query(
    `
    INSERT INTO Dataset (Reliability_minimum, Avatar, Name_dataset, Voucher, Field)
    VALUES ($1, $2, $3, $4, $5) returning *
    `,
    [reliability_minimum, avatar, name_dataset, voucher, field]
  );
  return datasets[0];
};

const getUserOwnedDatasetsDb = async (id_user) => {
  const { rows: datasets } = await client.query(
    `SELECT d.ID_Dataset,
            d.Name_dataset,
            v.Stock_percent,
            SUM(v.Price) AS Total_Amount
     FROM Dataset d
              JOIN
          Version v ON d.ID_Dataset = v.ID_Dataset
              JOIN
          Dataset_Expert de ON d.ID_Dataset = de.ID_Dataset
              JOIN
          Expert e ON de.ID_Expert = e.ID_Expert
     WHERE e.ID_User = $1
     GROUP BY d.ID_Dataset, d.Name_dataset, v.Stock_percent
    `,
    [id_user]
  );
  return datasets;
};
const getUserOwnedDatasetByIdDb = async (datasetId) => {
  const { rows: dataset } = await client.query(
    `SELECT d.ID_Dataset,
            d.Name_dataset,
            v.Stock_percent,
            SUM(v.Price) AS Total_Amount
     FROM Dataset d
              JOIN
          Version v ON d.ID_Dataset = v.ID_Dataset
              JOIN
          Database_Expert de ON d.ID_Dataset = de.ID_Dataset
              JOIN
          Expert e ON de.ID_Expert = e.ID_Expert
     WHERE e.ID_User = $1
     GROUP BY d.ID_Dataset, d.Name_dataset, v.Stock_percent
    `,
    [datasetId]
  );
  return dataset;
};
const getVersionDb = async (id_dataset, name_version) => {
  const { rows: version } = await client.query(
    `SELECT v.Price,
            v.Total_size,
            v.Number_of_data,
            v.Create_Date AS day_updated
     FROM Version v
     WHERE v.ID_dataset = $1
     ORDER BY v.ID_version ASC LIMIT 1
     OFFSET ($2 - 1)
    `,
    [id_dataset, name_version]
  );
  return version[0];
};

module.exports = {
  getDatasetAvatar,
  getAllDatasetsDb,
  getDatasetbyDatasetIdDb,
  createDatasetDb,
  getUserOwnedDatasetsDb,
  getUserOwnedDatasetByIdDb,
  getVersionDb,
};
