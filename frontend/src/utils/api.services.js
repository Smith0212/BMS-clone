import { fetchWrapper } from "../utils/axios.services";


const ADMIN = '/admin'


export function getCredential(data) {
    return fetchWrapper(`${ADMIN}/get_credentials`, data, 'GET');
}
