// Data structure: { Brand: { EngineType: { Model: [CCs] } } }
export const vehicleData: Record<string, Record<string, Record<string, number[]>>> = {
    "Honda": {
        "Petrol": {
            "Activa 6G": [110],
            "Dio": [110, 125],
            "Shine": [125],
            "SP 125": [125],
            "Unicorn": [160],
            "Hornet 2.0": [184],
            "CB350": [350]
        },
        "Electric": {}
    },
    "TVS": {
        "Petrol": {
            "Jupiter": [110, 125],
            "NTORQ 125": [125],
            "Raider": [125],
            "Apache RTR": [160, 180, 200],
            "Ronin": [225]
        },
        "Electric": {
            "iQube": [0] // CC not applicable
        }
    },
    "Hero": {
        "Petrol": {
            "Splendor+": [100],
            "HF Deluxe": [100],
            "Passion+": [100],
            "Super Splendor": [125],
            "Glamour": [125],
            "Xtreme 160R": [160],
            "Karizma XMR": [210]
        },
        "Electric": {
            "Vida V1": [0]
        }
    },
    "Bajaj": {
        "Petrol": {
            "Platina": [100, 110],
            "CT 110X": [110],
            "Pulsar": [125, 150, 160, 200, 250],
            "Avenger": [160, 220],
            "Dominar": [250, 400]
        },
        "Electric": {
            "Chetak": [0]
        }
    },
    "Royal Enfield": {
        "Petrol": {
            "Hunter 350": [350],
            "Classic 350": [350],
            "Bullet 350": [350],
            "Meteor 350": [350],
            "Himalayan": [411, 450],
            "Interceptor 650": [650],
            "Continental GT 650": [650]
        },
        "Electric": {}
    },
    "Suzuki": {
        "Petrol": {
            "Access 125": [125],
            "Burgman Street": [125],
            "Gixxer": [155],
            "V-Strom SX": [250]
        },
        "Electric": {}
    },
     "Yamaha": {
        "Petrol": {
            "RayZR 125": [125],
            "Fascino 125": [125],
            "FZ-S FI": [149],
            "R15 V4": [155],
            "MT-15 V2": [155]
        },
        "Electric": {}
    },
    "Other": {
        "Petrol": { "Other": [0] },
        "Electric": { "Other": [0] },
    }
};
