//import uuid from 'uuid';
//import { uuid} from 'uuid'
//import { type } from 'express/lib/response';
import { v4 as uuid } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types'; // REMOVE_ALERT

export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  const id = uuid();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
