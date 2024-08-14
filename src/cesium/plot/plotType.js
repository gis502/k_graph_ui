const plotType = {
    standbyTeam: {
        name:"待命队伍",
        teamName: {
            type: "text",
            name: "队伍名称",
            value: ""
        },
        // teamLocation: {
        //     province: {
        //         type: "text",
        //         name: "省",
        //         value: ""
        //     },
        //     city: {
        //         type: "text",
        //         name: "市（州）",
        //         value: ""
        //     },
        //     county: {
        //         type: "text",
        //         name: "县（市、区）",
        //         value: ""
        //     }
        // },
        personnelNumber: {
            type: "text",
            name: "人员数量",
            value: ""
        },
        teamNature: {
            type: "select",
            name: "队伍性质",
            value: "",
            content: [
                {
                    value: "fireRescueTeam",
                    label: "消防救援队伍"
                },
                {
                    value: "forestFirefightingTeam",
                    label: "森林消防队伍"
                },
                {
                    value: "professionalRescueTeam",
                    label: "专业救援队伍"
                },
                {
                    value: "socialEmergencyTeam",
                    label: "社会应急队伍"
                },
                {
                    value: "otherRescueTeams",
                    label: "其他救援队伍（驻川解放军、武警部队、民兵、党员突击队等）"
                }
            ]
        },
        teamType: {
            type: "select",
            name: "队伍类型",
            value: "",
            content: [
                {
                    value: "comprehensiveRescue",
                    label: "综合救援类"
                },
                {
                    value: "engineeringRescue",
                    label: "工程抢险类"
                },
                {
                    value: "waterRescue",
                    label: "水域救援类"
                },
                {
                    value: "drainageRescue",
                    label: "排涝抢险类"
                },
                {
                    value: "aerialRescue",
                    label: "航空救援类"
                },
                {
                    value: "emergencyCommunication",
                    label: "应急通信类"
                },
                {
                    value: "powerRescue",
                    label: "电力抢险类"
                },
                {
                    value: "medicalRescue",
                    label: "医疗救援类"
                },
                {
                    value: "logisticsSupport",
                    label: "后勤保障类"
                }
            ]
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhoneNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    dispatchedTeam: {
        name:"已出发队伍",
        teamName: {
            type: "text",
            name: "队伍名称",
            value: ""
        },
        teamLocation: {
            province: {
                type: "text",
                name: "省",
                value: ""
            },
            city: {
                type: "text",
                name: "市（州）",
                value: ""
            },
            county: {
                type: "text",
                name: "县（市、区）",
                value: ""
            }
        },
        personnelNumber: {
            type: "text",
            name: "人员数量",
            value: ""
        },
        teamNature: {
            type: "select",
            name: "队伍性质",
            value: "",
            content: [
                {
                    value: "fireRescueTeam",
                    label: "消防救援队伍"
                },
                {
                    value: "forestFirefightingTeam",
                    label: "森林消防队伍"
                },
                {
                    value: "professionalRescueTeam",
                    label: "专业救援队伍"
                },
                {
                    value: "socialEmergencyTeam",
                    label: "社会应急队伍"
                },
                {
                    value: "otherRescueTeams",
                    label: "其他救援队伍（驻川解放军、武警部队和民兵等）"
                }
            ]
        },
        teamType: {
            type: "select",
            name: "队伍类型",
            value: "",
            content: [
                {
                    value: "comprehensiveRescue",
                    label: "综合救援类"
                },
                {
                    value: "engineeringRescue",
                    label: "工程抢险类"
                },
                {
                    value: "waterRescue",
                    label: "水域救援类"
                },
                {
                    value: "drainageRescue",
                    label: "排涝抢险类"
                },
                {
                    value: "aerialRescue",
                    label: "航空救援类"
                },
                {
                    value: "emergencyCommunication",
                    label: "应急通信类"
                },
                {
                    value: "powerRescue",
                    label: "电力抢险类"
                },
                {
                    value: "medicalRescue",
                    label: "医疗救援类"
                },
                {
                    value: "logisticsSupport",
                    label: "后勤保障类"
                }
            ]
        },
        // departureDate: {
        //     type: "text",
        //     name: "出发日期",
        //     value: ""
        // },
        // estimatedArrivalDate: {
        //     type: "text",
        //     name: "预计到达日期",
        //     value: ""
        // },
        plannedRescueArea: {
            type: "text",
            name: "拟抢险救援区域",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhoneNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    participatingTeam: {
        name:"正在参与队伍",
        teamName: {
            type: "text",
            name: "队伍名称",
            value: ""
        },
        // teamLocation: {
        //     province: {
        //         type: "text",
        //         name: "省",
        //         value: ""
        //     },
        //     city: {
        //         type: "text",
        //         name: "市（州）",
        //         value: ""
        //     },
        //     county: {
        //         type: "text",
        //         name: "县（市、区）",
        //         value: ""
        //     }
        // },
        personnelNumber: {
            type: "text",
            name: "人员数量",
            value: ""
        },
        teamNature: {
            type: "select",
            name: "队伍性质",
            value: "",
            content: [
                {
                    value: "fireRescueTeam",
                    label: "消防救援队伍"
                },
                {
                    value: "forestFirefightingTeam",
                    label: "森林消防队伍"
                },
                {
                    value: "professionalRescueTeam",
                    label: "专业救援队伍"
                },
                {
                    value: "socialEmergencyTeam",
                    label: "社会应急队伍"
                },
                {
                    value: "otherRescueTeams",
                    label: "其他救援队伍（驻川解放军、武警部队和民兵等）"
                }
            ]
        },
        teamType: {
            type: "select",
            name: "队伍类型",
            value: "",
            content: [
                {
                    value: "comprehensiveRescue",
                    label: "综合救援类"
                },
                {
                    value: "engineeringRescue",
                    label: "工程抢险类"
                },
                {
                    value: "waterRescue",
                    label: "水域救援类"
                },
                {
                    value: "drainageRescue",
                    label: "排涝抢险类"
                },
                {
                    value: "aerialRescue",
                    label: "航空救援类"
                },
                {
                    value: "emergencyCommunication",
                    label: "应急通信类"
                },
                {
                    value: "powerRescue",
                    label: "电力抢险类"
                },
                {
                    value: "medicalRescue",
                    label: "医疗救援类"
                },
                {
                    value: "logisticsSupport",
                    label: "后勤保障类"
                }
            ]
        },
        // rescueStartDate: {
        //     type: "text",
        //     name: "抢险救援开始日期",
        //     value: ""
        // },
        // rescueEndDate: {
        //     type: "text",
        //     name: "抢险救援结束日期",
        //     value: ""
        // },
        rescueArea: {
            type: "text",
            name: "抢险救援区域",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhoneNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    injuredPerson: {
        name:"轻伤人员",
        location: {
            type: "text",
            name: "所在位置",
            value: ""
        },
        injuryStatus: {
            type: "select",
            name: "人员伤亡状态",
            value: "",
            content: [
                {
                    value: "minorInjury",
                    label: "轻伤"
                },
                {
                    value: "seriousInjury",
                    label: "重伤"
                },
                {
                    value: "criticalInjury",
                    label: "危重伤"
                },
                {
                    value: "death",
                    label: "死亡"
                }
            ]
        },
        abcdScore: {
            type: "select",
            name: "ABCD评分",
            value: "",
            content: [
                {
                    value: "asphyxia",
                    label: "窒息与呼吸困难"
                },
                {
                    value: "bleedingShock",
                    label: "出血与失血性休克"
                },
                {
                    value: "comaHeadInjury",
                    label: "昏迷与颅脑外伤"
                },
                {
                    value: "suddenDeath",
                    label: "正在发生的突然死亡"
                }
            ]
        },
        // newInjuries: {
        //     minorInjury: {
        //         type: "text",
        //         name: "轻伤新增人数",
        //         value: ""
        //     },
        //     seriousInjury: {
        //         type: "text",
        //         name: "重伤新增人数",
        //         value: ""
        //     },
        //     criticalInjury: {
        //         type: "text",
        //         name: "危重伤新增人数",
        //         value: ""
        //     },
        //     death: {
        //         type: "text",
        //         name: "死亡新增人数",
        //         value: ""
        //     }
        // },
        // cumulativeInjuries: {
        //     minorInjury: {
        //         type: "text",
        //         name: "轻伤累计人数",
        //         value: ""
        //     },
        //     seriousInjury: {
        //         type: "text",
        //         name: "重伤累计人数",
        //         value: ""
        //     },
        //     criticalInjury: {
        //         type: "text",
        //         name: "危重伤累计人数",
        //         value: ""
        //     },
        //     death: {
        //         type: "text",
        //         name: "死亡累计人数",
        //         value: ""
        //     }
        // },
        newInjuriesMinorInjury: {
            type: "text",
            name: "轻伤新增人数",
            value: ""
        },
        newInjuriesSeriousInjury: {
            type: "text",
            name: "重伤新增人数",
            value: ""
        },
        newInjuriesCriticalInjury: {
            type: "text",
            name: "危重伤新增人数",
            value: ""
        },
        newInjuriesDeath: {
            type: "text",
            name: "死亡新增人数",
            value: ""
        },
        minorInjury: {
            type: "text",
            name: "轻伤累计人数",
            value: ""
        },
        seriousInjury: {
            type: "text",
            name: "重伤累计人数",
            value: ""
        },
        criticalInjury: {
            type: "text",
            name: "危重伤累计人数",
            value: ""
        },
        death: {
            type: "text",
            name: "死亡累计人数",
            value: ""
        },
        medicalRescueTeam: {
            type: "text",
            name: "医疗救援队伍",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhoneNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    severelyInjuredPerson: {
        name:"重伤人员",
        location: {
            type: "text",
            name: "所在位置",
            value: ""
        },
        injuryStatus: {
            type: "select",
            name: "人员伤亡状态",
            value: "",
            content: [
                {
                    value: "minorInjury",
                    label: "轻伤"
                },
                {
                    value: "seriousInjury",
                    label: "重伤"
                },
                {
                    value: "criticalInjury",
                    label: "危重伤"
                },
                {
                    value: "death",
                    label: "死亡"
                }
            ]
        },
        abcdScore: {
            type: "select",
            name: "ABCD评分",
            value: "",
            content: [
                {
                    value: "asphyxia",
                    label: "窒息与呼吸困难"
                },
                {
                    value: "bleedingShock",
                    label: "出血与失血性休克"
                },
                {
                    value: "comaHeadInjury",
                    label: "昏迷与颅脑外伤"
                },
                {
                    value: "suddenDeath",
                    label: "正在发生的突然死亡"
                }
            ]
        },
        // newInjuries: {
        //
        // },
        newInjuriesMinorInjury: {
            type: "text",
            name: "轻伤新增人数",
            value: ""
        },
        newInjuriesSeriousInjury: {
            type: "text",
            name: "重伤新增人数",
            value: ""
        },
        newInjuriesCriticalInjury: {
            type: "text",
            name: "危重伤新增人数",
            value: ""
        },
        newInjuriesDeath: {
            type: "text",
            name: "死亡新增人数",
            value: ""
        },
        minorInjury: {
            type: "text",
            name: "轻伤累计人数",
            value: ""
        },
        seriousInjury: {
            type: "text",
            name: "重伤累计人数",
            value: ""
        },
        criticalInjury: {
            type: "text",
            name: "危重伤累计人数",
            value: ""
        },
        death: {
            type: "text",
            name: "死亡累计人数",
            value: ""
        },

        // cumulativeInjuries: {
        //     minorInjury: {
        //         type: "text",
        //         name: "轻伤累计人数",
        //         value: ""
        //     },
        //     seriousInjury: {
        //         type: "text",
        //         name: "重伤累计人数",
        //         value: ""
        //     },
        //     criticalInjury: {
        //         type: "text",
        //         name: "危重伤累计人数",
        //         value: ""
        //     },
        //     death: {
        //         type: "text",
        //         name: "死亡累计人数",
        //         value: ""
        //     }
        // },
        medicalRescueTeam: {
            type: "text",
            name: "医疗救援队伍",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhoneNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    criticallyInjuredPerson: {
        name:"危重伤人员",
        location: {
            type: "text",
            name: "所在位置",
            value: ""
        },
        injuryStatus: {
            type: "select",
            name: "人员伤亡状态",
            value: "",
            content: [
                {
                    value: "minorInjury",
                    label: "轻伤"
                },
                {
                    value: "seriousInjury",
                    label: "重伤"
                },
                {
                    value: "criticalInjury",
                    label: "危重伤"
                },
                {
                    value: "death",
                    label: "死亡"
                }
            ]
        },
        abcdScore: {
            type: "select",
            name: "ABCD评分",
            value: "",
            content: [
                {
                    value: "asphyxia",
                    label: "窒息与呼吸困难"
                },
                {
                    value: "bleedingShock",
                    label: "出血与失血性休克"
                },
                {
                    value: "comaHeadInjury",
                    label: "昏迷与颅脑外伤"
                },
                {
                    value: "suddenDeath",
                    label: "正在发生的突然死亡"
                }
            ]
        },
        // newInjuries: {
        //     minorInjury: {
        //         type: "text",
        //         name: "轻伤新增人数",
        //         value: ""
        //     },
        //     seriousInjury: {
        //         type: "text",
        //         name: "重伤新增人数",
        //         value: ""
        //     },
        //     criticalInjury: {
        //         type: "text",
        //         name: "危重伤新增人数",
        //         value: ""
        //     },
        //     death: {
        //         type: "text",
        //         name: "死亡新增人数",
        //         value: ""
        //     }
        // },
        // cumulativeInjuries: {
        //     minorInjury: {
        //         type: "text",
        //         name: "轻伤累计人数",
        //         value: ""
        //     },
        //     seriousInjury: {
        //         type: "text",
        //         name: "重伤累计人数",
        //         value: ""
        //     },
        //     criticalInjury: {
        //         type: "text",
        //         name: "危重伤累计人数",
        //         value: ""
        //     },
        //     death: {
        //         type: "text",
        //         name: "死亡累计人数",
        //         value: ""
        //     }
        // },
        newInjuriesMinorInjury: {
            type: "text",
            name: "轻伤新增人数",
            value: ""
        },
        newInjuriesSeriousInjury: {
            type: "text",
            name: "重伤新增人数",
            value: ""
        },
        newInjuriesCriticalInjury: {
            type: "text",
            name: "危重伤新增人数",
            value: ""
        },
        newInjuriesDeath: {
            type: "text",
            name: "死亡新增人数",
            value: ""
        },
        minorInjury: {
            type: "text",
            name: "轻伤累计人数",
            value: ""
        },
        seriousInjury: {
            type: "text",
            name: "重伤累计人数",
            value: ""
        },
        criticalInjury: {
            type: "text",
            name: "危重伤累计人数",
            value: ""
        },
        death: {
            type: "text",
            name: "死亡累计人数",
            value: ""
        },
        medicalRescueTeam: {
            type: "text",
            name: "医疗救援队伍",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhoneNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    deadPerson: {
        name:"死亡人员",
        location: {
            type: "text",
            name: "所在位置",
            value: ""
        },
        injuryStatus: {
            type: "select",
            name: "人员伤亡状态",
            value: "",
            content: [
                {
                    value: "minorInjury",
                    label: "轻伤"
                },
                {
                    value: "seriousInjury",
                    label: "重伤"
                },
                {
                    value: "criticalInjury",
                    label: "危重伤"
                },
                {
                    value: "death",
                    label: "死亡"
                }
            ]
        },
        abcdScore: {
            type: "select",
            name: "ABCD评分",
            value: "",
            content: [
                {
                    value: "asphyxia",
                    label: "窒息与呼吸困难"
                },
                {
                    value: "bleedingShock",
                    label: "出血与失血性休克"
                },
                {
                    value: "comaHeadInjury",
                    label: "昏迷与颅脑外伤"
                },
                {
                    value: "suddenDeath",
                    label: "正在发生的突然死亡"
                }
            ]
        },
        newInjuriesMinorInjury: {
            type: "text",
            name: "轻伤新增人数",
            value: ""
        },
        newInjuriesSeriousInjury: {
            type: "text",
            name: "重伤新增人数",
            value: ""
        },
        newInjuriesCriticalInjury: {
            type: "text",
            name: "危重伤新增人数",
            value: ""
        },
        newInjuriesDeath: {
            type: "text",
            name: "死亡新增人数",
            value: ""
        },
        minorInjury: {
            type: "text",
            name: "轻伤累计人数",
            value: ""
        },
        seriousInjury: {
            type: "text",
            name: "重伤累计人数",
            value: ""
        },
        criticalInjury: {
            type: "text",
            name: "危重伤累计人数",
            value: ""
        },
        death: {
            type: "text",
            name: "死亡累计人数",
            value: ""
        },
        // newInjuries: {
        //     minorInjury: {
        //         type: "text",
        //         name: "轻伤新增人数",
        //         value: ""
        //     },
        //     seriousInjury: {
        //         type: "text",
        //         name: "重伤新增人数",
        //         value: ""
        //     },
        //     criticalInjury: {
        //         type: "text",
        //         name: "危重伤新增人数",
        //         value: ""
        //     },
        //     death: {
        //         type: "text",
        //         name: "死亡新增人数",
        //         value: ""
        //     }
        // },
        // cumulativeInjuries: {
        //     minorInjury: {
        //         type: "text",
        //         name: "轻伤累计人数",
        //         value: ""
        //     },
        //     seriousInjury: {
        //         type: "text",
        //         name: "重伤累计人数",
        //         value: ""
        //     },
        //     criticalInjury: {
        //         type: "text",
        //         name: "危重伤累计人数",
        //         value: ""
        //     },
        //     death: {
        //         type: "text",
        //         name: "死亡累计人数",
        //         value: ""
        //     }
        // },
        medicalRescueTeam: {
            type: "text",
            name: "医疗救援队伍",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhoneNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    basicallyIntactBuildings:{
        name:"基本完好建筑物",
        personnelCasualties:{
            type:"select",
            name:"人员伤亡",
            value:"",
            content:[
                {
                    value: "noCasualties",
                    label: "无"
                },
                {
                    value: "casualties10OrLess",
                    label: "有（10人及以下）"
                },
                {
                    value: "casualtiesMoreThan10",
                    label: "有（10人以上）"
                }
            ]
        },
        natureOfUse:{
            type:"select",
            name:"使用性质",
            value:"",
            content:[
                {
                    value:"residentialBuilding",
                    label:"住宅楼"
                },
                {
                    value:"selfBuiltHouses",
                    label:"自建房"
                },
                {
                    value:"officeBuilding",
                    label:"办公楼"
                },
                {
                    value:"school",
                    label:"学校"
                },
                {
                    value:"hospital",
                    label:"医院"
                },
                {
                    value:"workshop",
                    label:"厂房"
                },
                {
                    value:"warehouse",
                    label:"仓库"
                },
                {
                    value:"gymnasium",
                    label:"体育馆"
                },
                {
                    value:"exhibitionHall",
                    label:"展览馆"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        structureType:{
            type:"select",
            name:"结构类型",
            value:"",
            content:[
                {
                    value:"brickAndWoodStructure",
                    label:"砖木结构"
                },
                {
                    value:"brickConcreteStructure",
                    label:"砖混结构"
                },
                {
                    value:"reinforcedConcreteStructure ",
                    label:"钢筋混凝土结构"
                },
                {
                    value:"steelStructure",
                    label:"钢结构"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        damageModel:{
            type:"select",
            name:"破坏模式",
            value:"",
            content:[
                {
                    value:"vibrationDamage",
                    label:"振动破坏（地面振动通过基础传递到建筑物导致）"
                },
                {
                    value:"foundationFailure",
                    label:"地基失效破坏（如震后地基不均匀沉降、水平变位等导致）"
                },
                {
                    value:"secondaryEffectDamage",
                    label:"次生效应破坏（如震后滑坡、崩塌等导致）"
                },
            ]
        },
        disposalTeam:{
            type:"text",
            name:"处置队伍",
            value:""
        },
        disposalMeasures:{
            type:"text",
            name:"处置措施",
            value:""
        },
        disposalPhase:{
            type:"select",
            name:"处置阶段",
            value:"",
            content:[
                {
                    value:"notYetProcessed",
                    label:"暂未处置"
                },
                {
                    value:"processing",
                    label:"正在处置"
                },
                {
                    value:"completeDisposal",
                    label:"完成处置"
                },
            ]
        },
        disposalProcess:{
            type:"partText",
            name:"处置过程",
            value:""
        },
        contactStaff:{
            type:"text",
            name:"联系人员",
            value:""
        },
        contactNumber:{
            type:"text",
            name:"联系电话",
            value:""
        },
    },
    moderatelyDamagedBuildings:{
        name:"中等破坏建筑物",
        personnelCasualties:{
            type:"select",
            name:"人员伤亡",
            value:"",
            content:[
                {
                    value: "noCasualties",
                    label: "无"
                },
                {
                    value: "casualties10OrLess",
                    label: "有（10人及以下）"
                },
                {
                    value: "casualtiesMoreThan10",
                    label: "有（10人以上）"
                }
            ]
        },
        natureOfUse:{
            type:"select",
            name:"使用性质",
            value:"",
            content:[
                {
                    value:"residentialBuilding",
                    label:"住宅楼"
                },
                {
                    value:"selfBuiltHouses",
                    label:"自建房"
                },
                {
                    value:"officeBuilding",
                    label:"办公楼"
                },
                {
                    value:"school",
                    label:"学校"
                },
                {
                    value:"hospital",
                    label:"医院"
                },
                {
                    value:"workshop",
                    label:"厂房"
                },
                {
                    value:"warehouse",
                    label:"仓库"
                },
                {
                    value:"gymnasium",
                    label:"体育馆"
                },
                {
                    value:"exhibitionHall",
                    label:"展览馆"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        structureType:{
            type:"select",
            name:"结构类型",
            value:"",
            content:[
                {
                    value:"brickAndWoodStructure",
                    label:"砖木结构"
                },
                {
                    value:"brickConcreteStructure",
                    label:"砖混结构"
                },
                {
                    value:"reinforcedConcreteStructure ",
                    label:"钢筋混凝土结构"
                },
                {
                    value:"steelStructure",
                    label:"钢结构"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        damageModel:{
            type:"select",
            name:"破坏模式",
            value:"",
            content:[
                {
                    value:"vibrationDamage",
                    label:"振动破坏（地面振动通过基础传递到建筑物导致）"
                },
                {
                    value:"foundationFailure",
                    label:"地基失效破坏（如震后地基不均匀沉降、水平变位等导致）"
                },
                {
                    value:"secondaryEffectDamage",
                    label:"次生效应破坏（如震后滑坡、崩塌等导致）"
                },
            ]
        },
        disposalTeam:{
            type:"text",
            name:"处置队伍",
            value:""
        },
        disposalMeasures:{
            type:"text",
            name:"处置措施",
            value:""
        },
        disposalPhase:{
            type:"select",
            name:"处置阶段",
            value:"",
            content:[
                {
                    value:"notYetProcessed",
                    label:"暂未处置"
                },
                {
                    value:"processing",
                    label:"正在处置"
                },
                {
                    value:"completeDisposal",
                    label:"完成处置"
                },
            ]
        },
        disposalProcess:{
            type:"partText",
            name:"处置过程",
            value:""
        },
        contactStaff:{
            type:"text",
            name:"联系人员",
            value:""
        },
        contactNumber:{
            type:"text",
            name:"联系电话",
            value:""
        },
    },
    seriousDamageBuildings:{
        name:"严重破坏建筑物",
        personnelCasualties:{
            type:"select",
            name:"人员伤亡",
            value:"",
            content:[
                {
                    value: "noCasualties",
                    label: "无"
                },
                {
                    value: "casualties10OrLess",
                    label: "有（10人及以下）"
                },
                {
                    value: "casualtiesMoreThan10",
                    label: "有（10人以上）"
                }
            ]
        },
        natureOfUse:{
            type:"select",
            name:"使用性质",
            value:"",
            content:[
                {
                    value:"residentialBuilding",
                    label:"住宅楼"
                },
                {
                    value:"selfBuiltHouses",
                    label:"自建房"
                },
                {
                    value:"officeBuilding",
                    label:"办公楼"
                },
                {
                    value:"school",
                    label:"学校"
                },
                {
                    value:"hospital",
                    label:"医院"
                },
                {
                    value:"workshop",
                    label:"厂房"
                },
                {
                    value:"warehouse",
                    label:"仓库"
                },
                {
                    value:"gymnasium",
                    label:"体育馆"
                },
                {
                    value:"exhibitionHall",
                    label:"展览馆"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        structureType:{
            type:"select",
            name:"结构类型",
            value:"",
            content:[
                {
                    value:"brickAndWoodStructure",
                    label:"砖木结构"
                },
                {
                    value:"brickConcreteStructure",
                    label:"砖混结构"
                },
                {
                    value:"reinforcedConcreteStructure ",
                    label:"钢筋混凝土结构"
                },
                {
                    value:"steelStructure",
                    label:"钢结构"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        damageModel:{
            type:"select",
            name:"破坏模式",
            value:"",
            content:[
                {
                    value:"vibrationDamage",
                    label:"振动破坏（地面振动通过基础传递到建筑物导致）"
                },
                {
                    value:"foundationFailure",
                    label:"地基失效破坏（如震后地基不均匀沉降、水平变位等导致）"
                },
                {
                    value:"secondaryEffectDamage",
                    label:"次生效应破坏（如震后滑坡、崩塌等导致）"
                },
            ]
        },
        disposalTeam:{
            type:"text",
            name:"处置队伍",
            value:""
        },
        disposalMeasures:{
            type:"text",
            name:"处置措施",
            value:""
        },
        disposalPhase:{
            type:"select",
            name:"处置阶段",
            value:"",
            content:[
                {
                    value:"notYetProcessed",
                    label:"暂未处置"
                },
                {
                    value:"processing",
                    label:"正在处置"
                },
                {
                    value:"completeDisposal",
                    label:"完成处置"
                },
            ]
        },
        disposalProcess:{
            type:"partText",
            name:"处置过程",
            value:""
        },
        contactStaff:{
            type:"text",
            name:"联系人员",
            value:""
        },
        contactNumber:{
            type:"text",
            name:"联系电话",
            value:""
        },
    },
    destructionCollapseBuildings:{
        name:"毁坏或倒塌建筑物",
        personnelCasualties:{
            type:"select",
            name:"人员伤亡",
            value:"",
            content:[
                {
                    value: "noCasualties",
                    label: "无"
                },
                {
                    value: "casualties10OrLess",
                    label: "有（10人及以下）"
                },
                {
                    value: "casualtiesMoreThan10",
                    label: "有（10人以上）"
                }
            ]
        },
        natureOfUse:{
            type:"select",
            name:"使用性质",
            value:"",
            content:[
                {
                    value:"residentialBuilding",
                    label:"住宅楼"
                },
                {
                    value:"selfBuiltHouses",
                    label:"自建房"
                },
                {
                    value:"officeBuilding",
                    label:"办公楼"
                },
                {
                    value:"school",
                    label:"学校"
                },
                {
                    value:"hospital",
                    label:"医院"
                },
                {
                    value:"workshop",
                    label:"厂房"
                },
                {
                    value:"warehouse",
                    label:"仓库"
                },
                {
                    value:"gymnasium",
                    label:"体育馆"
                },
                {
                    value:"exhibitionHall",
                    label:"展览馆"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        structureType:{
            type:"select",
            name:"结构类型",
            value:"",
            content:[
                {
                    value:"brickAndWoodStructure",
                    label:"砖木结构"
                },
                {
                    value:"brickConcreteStructure",
                    label:"砖混结构"
                },
                {
                    value:"reinforcedConcreteStructure ",
                    label:"钢筋混凝土结构"
                },
                {
                    value:"steelStructure",
                    label:"钢结构"
                },
                {
                    value:"other",
                    label:"其它"
                },
            ]
        },
        damageModel:{
            type:"select",
            name:"破坏模式",
            value:"",
            content:[
                {
                    value:"vibrationDamage",
                    label:"振动破坏（地面振动通过基础传递到建筑物导致）"
                },
                {
                    value:"foundationFailure",
                    label:"地基失效破坏（如震后地基不均匀沉降、水平变位等导致）"
                },
                {
                    value:"secondaryEffectDamage",
                    label:"次生效应破坏（如震后滑坡、崩塌等导致）"
                },
            ]
        },
        disposalTeam:{
            type:"text",
            name:"处置队伍",
            value:""
        },
        disposalMeasures:{
            type:"text",
            name:"处置措施",
            value:""
        },
        disposalPhase:{
            type:"select",
            name:"处置阶段",
            value:"",
            content:[
                {
                    value:"notYetProcessed",
                    label:"暂未处置"
                },
                {
                    value:"processing",
                    label:"正在处置"
                },
                {
                    value:"completeDisposal",
                    label:"完成处置"
                },
            ]
        },
        disposalProcess:{
            type:"partText",
            name:"处置过程",
            value:""
        },
        contactStaff:{
            type:"text",
            name:"联系人员",
            value:""
        },
        contactNumber:{
            type:"text",
            name:"联系电话",
            value:""
        },
    },
    restrictedHighway: {
        name: "限制通行公路",
        roadName: {
            type: "text",
            name: "公路名称",
            value: ""
        },
        roadLevel: {
            type: "select",
            name: "公路级别",
            value: "",
            content: [
                {
                    value: "highway",
                    label: "高速"
                },
                {
                    value: "nationalRoad",
                    label: "国道"
                },
                {
                    value: "provincialRoad",
                    label: "省道"
                },
                {
                    value: "countyRoad",
                    label: "县道"
                },
                {
                    value: "townshipRoad",
                    label: "乡道"
                },
                {
                    value: "other",
                    label: "其它"
                }
            ]
        }
    },
    impassableHighway: {
        name: "不可通行公路",
        roadName: {
            type: "text",
            name: "公路名称",
            value: ""
        },
        roadLevel: {
            type: "select",
            name: "公路级别",
            value: "",
            content: [
                {
                    value: "highway",
                    label: "高速"
                },
                {
                    value: "nationalRoad",
                    label: "国道"
                },
                {
                    value: "provincialRoad",
                    label: "省道"
                },
                {
                    value: "countyRoad",
                    label: "县道"
                },
                {
                    value: "townshipRoad",
                    label: "乡道"
                },
                {
                    value: "other",
                    label: "其它"
                }
            ]
        }
    },
    roadDamagePoint: {
        name: "公路破坏点",
            roadName: {
            type: "text",
                name: "公路名称",
                value: ""
        },
        roadLevel: {
            type: "select",
                name: "公路等级",
                value: "",
                content: [
                {
                    value: "highway",
                    label: "高速"
                },
                {
                    value: "nationalRoad",
                    label: "国道"
                },
                {
                    value: "provincialRoad",
                    label: "省道"
                },
                {
                    value: "countyRoad",
                    label: "县道"
                },
                {
                    value: "townshipRoad",
                    label: "乡道"
                },
                {
                    value: "other",
                    label: "其它"
                }
            ]
        },
        casualties: {
            type: "select",
                name: "人员伤亡",
                value: "",
                content: [
                {
                    value: "noCasualties",
                    label: "无"
                },
                {
                    value: "casualties10OrLess",
                    label: "有（10人及以下）"
                },
                {
                    value: "casualtiesMoreThan10",
                    label: "有（10人以上）"
                }
            ]
        },
        damageType: {
            type: "select",
                name: "破坏形式",
                value: "",
                content: [
                {
                    value: "pavementDamage",
                    label: "路面破坏（如路面出现裂缝、悬空、断裂等）"
                },
                {
                    value: "subgradeDamage",
                    label: "路基破坏（如路基隆起、沉陷等）"
                },
                {
                    value: "slopeDamage",
                    label: "边坡破坏（如震后滑坡、崩塌等）"
                }
            ]
        },
        disposalTeam: {
            type: "text",
                name: "处置队伍",
                value: ""
        },
        disposalMeasures: {
            type: "text",
                name: "处置措施",
                value: ""
        },
        disposalPhase: {
            type: "select",
                name: "先期处置阶段",
                value: "",
                content: [
                {
                    value: "notProcessed",
                    label: "暂未处置"
                },
                {
                    value: "processing",
                    label: "正在处置"
                },
                {
                    value: "completed",
                    label: "完成处置"
                }
            ]
        },
        initialDisposalTime: {
            type: "text",
                name: "先期处置时间",
                value: ""
        },
        estimatedDisposalTime: {
            type: "text",
                name: "预计处置时间",
                value: ""
        },
        actualDisposalTime: {
            type: "text",
                name: "实际处置时间",
                value: ""
        },
        contactPerson: {
            type: "text",
                name: "联系人员",
                value: ""
        },
        contactPhone: {
            type: "text",
                name: "联系电话",
                value: ""
        }
    },
    trafficControlPoint: {
        name: "交通管制点",
        roadName: {
            type: "text",
            name: "公路名称",
            value: ""
        },
        roadLevel: {
            type: "select",
            name: "公路等级",
            value: "",
            content: [
                {
                    value: "highway",
                    label: "高速"
                },
                {
                    value: "nationalRoad",
                    label: "国道"
                },
                {
                    value: "provincialRoad",
                    label: "省道"
                },
                {
                    value: "countyRoad",
                    label: "县道"
                },
                {
                    value: "townshipRoad",
                    label: "乡道"
                },
                {
                    value: "other",
                    label: "其它"
                }
            ]
        },
        controlType: {
            type: "select",
            name: "管制类型",
            value: "",
            content: [
                {
                    value: "restricted",
                    label: "限行"
                },
                {
                    value: "prohibited",
                    label: "禁行"
                }
            ]
        },
        controlUnit: {
            type: "text",
            name: "管制单位",
            value: ""
        },
        contactPhone: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    unpassableTunnel: {
        name: "不可通行隧道",
        tunnelName: {
            type: "text",
            name: "隧道名称",
            value: ""
        },
        lineName: {
            type: "text",
            name: "所在线路",
            value: ""
        },
        tunnelType: {
            type: "select",
            name: "隧道类型",
            value: "",
            content: [
                {
                    value: "shortTunnel",
                    label: "短隧道（≤0.5km）"
                },
                {
                    value: "mediumTunnel",
                    label: "中隧道（0.5-3km）"
                },
                {
                    value: "longTunnel",
                    label: "长隧道（3-10km）"
                },
                {
                    value: "superLongTunnel",
                    label: "特长隧道（＞10km）"
                }
            ]
        },
        personnelCasualties: {
            type: "select",
            name: "人员伤亡",
            value: "",
            content: [
                {
                    value: "noCasualties",
                    label: "无"
                },
                {
                    value: "hasCasualties",
                    label: "有"
                }
            ]
        },
        damageType: {
            type: "select",
            name: "破坏形式",
            value: "",
            content: [
                {
                    value: "liningDamage",
                    label: "衬砌破坏（如开裂、剥落、移位、坍塌等）"
                },
                {
                    value: "floorDamage",
                    label: "底板破坏（如底板开裂、隆起等）"
                },
                {
                    value: "entranceDamage",
                    label: "洞口破坏（洞口塌方、洞门裂损等）"
                }
            ]
        },
        disposalTeam: {
            type: "text",
            name: "处置队伍",
            value: ""
        },
        disposalMeasures: {
            type: "text",
            name: "处置措施",
            value: ""
        },
        disposalPhase: {
            type: "select",
            name: "先期处置阶段",
            value: "",
            content: [
                {
                    value: "notProcessed",
                    label: "暂未处置"
                },
                {
                    value: "processing",
                    label: "正在处置"
                },
                {
                    value: "completed",
                    label: "完成处置"
                }
            ]
        },
        // initialDisposalTime: {
        //     type: "text",
        //     name: "先期处置时间",
        //     value: ""
        // },
        // estimatedDisposalTime: {
        //     type: "text",
        //     name: "预计处置时间",
        //     value: ""
        // },
        // actualDisposalTime: {
        //     type: "text",
        //     name: "实际处置时间",
        //     value: ""
        // },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhone: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    barrierLake: {
        name: "堰塞湖",
        waterSystem: {
            type: "text",
            name: "所在水系",
            value: ""
        },
        length: {
            type: "text",
            name: "顺河长度 (m)",
            value: ""
        },
        width: {
            type: "text",
            name: "宽度 (m)",
            value: ""
        },
        height: {
            type: "text",
            name: "高度 (m)",
            value: ""
        },
        barrierRisk: {
            type: "select",
            name: "堰塞体危险性",
            value: "",
            content: [
                {
                    value: "lowRisk",
                    label: "低危险"
                },
                {
                    value: "mediumRisk",
                    label: "中危险"
                },
                {
                    value: "highRisk",
                    label: "高危险"
                },
                {
                    value: "extremeRisk",
                    label: "极高危险"
                }
            ]
        },
        estimatedStorage: {
            type: "select",
            name: "预估库容",
            value: "",
            content: [
                {
                    value: "lessThan1Million",
                    label: "≤100万方"
                },
                {
                    value: "between1MillionAnd10Million",
                    label: "100-1000万方"
                },
                {
                    value: "between10MillionAnd100Million",
                    label: "1000万方-1亿方"
                },
                {
                    value: "moreThan100Million",
                    label: "≥1亿方"
                }
            ]
        },
        floodImpactArea: {
            type: "select",
            name: "淹没和溃决影响区",
            value: "",
            content: [
                {
                    value: "townAndVillage",
                    label: "城镇乡村"
                },
                {
                    value: "industrialAndMining",
                    label: "工矿企业"
                },
                {
                    value: "keyInfrastructure",
                    label: "重要基础设施"
                },
                {
                    value: "other",
                    label: "其他（如文物、珍稀动植物、水源地等）"
                }
            ]
        },
        disposalTeam: {
            type: "text",
            name: "处置队伍",
            value: ""
        },
        disposalMeasures: {
            type: "text",
            name: "处置措施",
            value: ""
        },
        disposalPhase: {
            type: "select",
            name: "先期处置阶段",
            value: "",
            content: [
                {
                    value: "notProcessed",
                    label: "暂未处置"
                },
                {
                    value: "processing",
                    label: "正在处置"
                },
                {
                    value: "completed",
                    label: "完成处置"
                }
            ]
        },
        // initialDisposalTime: {
        //     type: "text",
        //     name: "先期处置时间",
        //     value: ""
        // },
        // estimatedDisposalTime: {
        //     type: "text",
        //     name: "预计处置时间",
        //     value: ""
        // },
        // actualDisposalTime: {
        //     type: "text",
        //     name: "实际处置时间",
        //     value: ""
        // },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactPhone: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    OutDoorShelter: {
        name: "室内型避难场所",
        shelterName: {
            type: "text",
            name: "场所名称",
            value: ""
        },
        shelterLevel: {
            type: "select",
            name: "场所级别",
            value: "",
            content: [
                {
                    value: "provincial",
                    label: "省级"
                },
                {
                    value: "municipal",
                    label: "市级"
                },
                {
                    value: "county",
                    label: "县级"
                },
                {
                    value: "township",
                    label: "乡镇（街道）级"
                },
                {
                    value: "village",
                    label: "村（社区）级"
                }
            ]
        },
        shelterFunction: {
            type: "select",
            name: "场所功能",
            value: "",
            content: [
                {
                    value: "singleFunction",
                    label: "单一性"
                },
                {
                    value: "comprehensive",
                    label: "综合性"
                },
                {
                    value: "specificShelter",
                    label: "特定避难场所"
                }
            ]
        },
        shelterType: {
            type: "select",
            name: "场所类型",
            value: "",
            content: [
                {
                    value: "emergency",
                    label: "紧急型（1天以内）"
                },
                {
                    value: "shortTerm",
                    label: "短期型（2-14天）"
                },
                {
                    value: "longTerm",
                    label: "长期型（15-180天）"
                }
            ]
        },
        capacity: {
            type: "select",
            name: "避难人员数量",
            value: "",
            content: [
                {
                    value: "lessThan50",
                    label: "50人以下"
                },
                {
                    value: "between50And100",
                    label: "50-100人"
                },
                {
                    value: "between100And200",
                    label: "100-200人"
                },
                {
                    value: "between200And500",
                    label: "200-500人"
                },
                {
                    value: "moreThan500",
                    label: "500人以上"
                }
            ]
        },
        managementUnit: {
            type: "text",
            name: "管护单位",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    inDoorShelter: {
        name: "室内型避难场所",
        shelterName: {
            type: "text",
            name: "场所名称",
            value: ""
        },
        shelterLevel: {
            type: "select",
            name: "场所级别",
            value: "",
            content: [
                {
                    value: "provincial",
                    label: "省级"
                },
                {
                    value: "municipal",
                    label: "市级"
                },
                {
                    value: "county",
                    label: "县级"
                },
                {
                    value: "township",
                    label: "乡镇（街道）级"
                },
                {
                    value: "village",
                    label: "村（社区）级"
                }
            ]
        },
        shelterFunction: {
            type: "select",
            name: "场所功能",
            value: "",
            content: [
                {
                    value: "singleFunction",
                    label: "单一性"
                },
                {
                    value: "comprehensive",
                    label: "综合性"
                },
                {
                    value: "specificShelter",
                    label: "特定避难场所"
                }
            ]
        },
        shelterType: {
            type: "select",
            name: "场所类型",
            value: "",
            content: [
                {
                    value: "emergency",
                    label: "紧急型（1天以内）"
                },
                {
                    value: "shortTerm",
                    label: "短期型（2-14天）"
                },
                {
                    value: "longTerm",
                    label: "长期型（15-180天）"
                }
            ]
        },
        capacity: {
            type: "select",
            name: "避难人员数量",
            value: "",
            content: [
                {
                    value: "lessThan50",
                    label: "50人以下"
                },
                {
                    value: "between50And100",
                    label: "50-100人"
                },
                {
                    value: "between100And200",
                    label: "100-200人"
                },
                {
                    value: "between200And500",
                    label: "200-500人"
                },
                {
                    value: "moreThan500",
                    label: "500人以上"
                }
            ]
        },
        managementUnit: {
            type: "text",
            name: "管护单位",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    permanentShelter: {
        name: "常备避险安置点",
        shelterName: {
            type: "text",
            name: "安置点名称",
            value: ""
        },
        shelterType: {
            type: "select",
            name: "安置点类型",
            value: "",
            content: [
                {
                    value: "villageActivityRoom",
                    label: "村活动室"
                },
                {
                    value: "school",
                    label: "学校"
                },
                {
                    value: "healthClinic",
                    label: "卫生院"
                },
                {
                    value: "factory",
                    label: "企业厂房"
                },
                {
                    value: "other",
                    label: "其他"
                }
            ]
        },
        functionalArea: {
            type: "select",
            name: "功能区",
            value: "",
            content: [
                {
                    value: "accommodationArea",
                    label: "住宿区"
                },
                {
                    value: "diningArea",
                    label: "餐饮区"
                },
                {
                    value: "washArea",
                    label: "清洗盥洗区"
                },
                {
                    value: "storageRoom",
                    label: "物资储备室"
                },
                {
                    value: "studyArea",
                    label: "学习区"
                },
                {
                    value: "motherAndChildRoom",
                    label: "母婴室"
                },
                {
                    value: "recreationArea",
                    label: "文体活动区"
                },
                {
                    value: "other",
                    label: "其他"
                }
            ]
        },
        basicSupport: {
            type: "select",
            name: "基础保障",
            value: "",
            content: [
                {
                    value: "accessRoad",
                    label: "通路"
                },
                {
                    value: "electricity",
                    label: "通电"
                },
                {
                    value: "waterSupply",
                    label: "通水"
                },
                {
                    value: "internet",
                    label: "通网"
                }
            ]
        },
        capacity: {
            type: "select",
            name: "容纳人数",
            value: "",
            content: [
                {
                    value: "lessThan50",
                    label: "50人以下"
                },
                {
                    value: "between50And100",
                    label: "50-100人"
                },
                {
                    value: "between100And200",
                    label: "100-200人"
                },
                {
                    value: "moreThan200",
                    label: "200人以上"
                }
            ]
        },
        managementUnit: {
            type: "text",
            name: "管护单位",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    temporaryShelter: {
        name: "临时避险安置点",
        shelterName: {
            type: "text",
            name: "安置点名称",
            value: ""
        },
        shelterType: {
            type: "select",
            name: "安置点类型",
            value: "",
            content: [
                {
                    value: "tent",
                    label: "帐篷"
                },
                {
                    value: "prefabHouse",
                    label: "板房"
                },
                {
                    value: "other",
                    label: "其他"
                }
            ]
        },
        basicSupport: {
            type: "select",
            name: "基础保障",
            value: "",
            content: [
                {
                    value: "accessRoad",
                    label: "通路"
                },
                {
                    value: "electricity",
                    label: "通电"
                },
                {
                    value: "waterSupply",
                    label: "通水"
                },
                {
                    value: "internet",
                    label: "通网"
                }
            ]
        },
        capacity: {
            type: "select",
            name: "容纳人数",
            value: "",
            content: [
                {
                    value: "lessThan20",
                    label: "20人以下"
                },
                {
                    value: "between20And50",
                    label: "20-50人"
                },
                {
                    value: "between50And100",
                    label: "50-100人"
                },
                {
                    value: "moreThan100",
                    label: "100人以上"
                }
            ]
        },
        managementUnit: {
            type: "text",
            name: "管理单位",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    },
    disasterReliefSuppliesWarehouse: {
        name: "救灾物资储备库",
        WarehouseName: {
            type: "text",
            name: "储备库名称",
            value: ""
        },
        location: {
            type: "text",
            name: "储备库位置",
            value: ""
        },
        warehouseLevel: {
            type: "select",
            name: "储备库级别",
            value: "",
            content: [
                {
                    value: "central",
                    label: "中央级(区域性)"
                },
                {
                    value: "provincial",
                    label: "省级"
                },
                {
                    value: "municipal",
                    label: "市级"
                },
                {
                    value: "county",
                    label: "县级"
                },
                {
                    value: "township",
                    label: "乡级"
                }
            ]
        },
        materialType: {
            type: "select",
            name: "物资类型",
            value: "",
            content: [
                {
                    value: "emergencyRescue",
                    label: "抢险救援保障物资"
                },
                {
                    value: "emergencySupport",
                    label: "应急救援力量保障物资"
                },
                {
                    value: "basicLiving",
                    label: "基本生活保障物资"
                }
            ]
        },
        managementUnit: {
            type: "text",
            name: "管护单位",
            value: ""
        },
        contactPerson: {
            type: "text",
            name: "联系人员",
            value: ""
        },
        contactNumber: {
            type: "text",
            name: "联系电话",
            value: ""
        }
    }
}
export {plotType}