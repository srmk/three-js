export const DYNAMIC_UPDATE = 'dynamicUpdate';

export const updateData = (keyName, value) => (dispatch) => {
    return dispatch({
        type: DYNAMIC_UPDATE,
        payload: {
            [keyName]: value
        }
    });
};