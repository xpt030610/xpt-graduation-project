import { defineStore } from "pinia";
import Axios from "../utils/axios";
export const useStore = defineStore("user", {
  state: () => ({
    isAdmin: false, // 是否是管理员
    userInfo: {}, // 用户信息
    noticeList: [], // 通知列表
    repairList: [],
    isRoom: false,
    roomInfo: {},
  }),
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      this.isAdmin = userInfo.role === "管理员"; // 根据角色设置 isAdmin
      console.log("pinia userInfo", this.userInfo);
      console.log("pinia isAdmin", this.isAdmin);
    },
    async getNoticeList() {
      const response = await Axios.post("/dorm/getMemberNotices", {
        userId: this.userInfo.userId,
      });
      this.noticeList = response.data;
      console.log("获取通知列表:", response.data);
    },
    setRoomInfo(room) {
      if (room) {
        this.isRoom = true;
        this.roomInfo = room;
      } else {
        this.isRoom = false;
        this.roomInfo = {};
      }
      console.log("pinia roomInfo", this.roomInfo, this.isRoom);
    },
    async getRepairList() {
      const response = await Axios.post("/repair/getRepairList");

      if (this.isAdmin) {
        this.repairList = response.data.data;
      } else {
        this.repairList = response.data.data.filter(
          (item) => item.reporterId === this.userInfo.userId
        );
      }
      console.log("获取维修列表:", response.data, this.repairList);
    },
  },
});
