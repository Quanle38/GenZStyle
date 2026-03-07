export function calculateShippingFee(distanceKm : number) : number {
    // phí_ship = phí_cơ_bản 
        //  + (km - km_miễn_phí) × phí_mỗi_km
    const baseDistance = 3;
    const baseFee = 20000;
    const extraPerKm = 5000;
    const maxFee = 200000;
    if(distanceKm <= baseDistance){
        return baseFee;
    }
    const extraKm = Math.ceil(distanceKm - baseDistance);
    const fee = baseFee + (extraKm * extraPerKm);
    return Math.min(fee, maxFee);
} 