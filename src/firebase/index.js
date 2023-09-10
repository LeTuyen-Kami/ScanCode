import database from '@react-native-firebase/database';

const reference = database().ref('/data');

export const createData = async ({
  deviceId,
  billCode,
  billStatus,
  testResult,
  testDate,
}) => {
  const data = {
    deviceId,
    billCode,
    billStatus,
    testResult,
    testDate,
  };

  return reference
    .push()
    .set(data)
    .then(() => {
      return 'success';
    })
    .catch(error => {
      return error;
    });
};

export const getAllData = async () => {
  return reference
    .once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        const result = keys.map(key => {
          return {
            id: key,
            ...data[key],
          };
        });
        return result;
      }
      return [];
    })
    .catch(error => {
      return error;
    });
};

export const getData = async deviceId => {
  return reference
    .orderByChild('deviceId')
    .equalTo(deviceId)
    .once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        const result = keys.map(key => {
          return {
            id: key,
            ...data[key],
          };
        });
        return result?.[0];
      }
      return null;
    })
    .catch(error => {
      return error;
    });
};

export const updateData = async (id, data) => {
  return reference
    .child(id)
    .update(data)
    .then(() => {
      return 'success';
    })
    .catch(error => {
      return error;
    });
};
