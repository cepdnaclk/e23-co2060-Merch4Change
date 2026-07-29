import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import Product from "../models/Product.js";
import { validateTime, isStarted, validBid } from "../validators/auction.validator.js";


// POST api/auctions
export const createAuction = async (req, res) => {
    try {
        const { productId, startPrice, bidIncrement, startTime, endTime } = req.body;
        
        // validate productId
        if (!productId) {
            return res.status(400).json({ success: false, message: "No productId has passed."})
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product is not found!"});
        }

        // validate start time and end time 
        const isValidDate = validateTime(startTime, endTime);
        if (!isValidDate) {
            return res.status(404).json({ success: false, message: "Invalid time inputs"});
        }

        // check is started 
        const hasStarted = isStarted(startTime);
        let status = null;
        if (!hasStarted) {
            status = "scheduled";
        } else {
            status = "active";
        }

        const auction = await Auction.create({
            productId: productId,
            startPrice: startPrice,
            currentPrice: startPrice,
            currentBidder: null,
            startTime: startTime,
            endTime: endTime, 
            createdBy: req.user._id,
            status: status
        });

        res.status(201).json({success: true, auction});
    } catch(err){
        res.status(500).json({success: false, message: err.message});
    }
}

// POST api/auctions/:id/bid
export const placeBid = async (req, res) => {
    try{
        const { id } = req.params;
        const { amount } = req.body;
        const userId = req.user._id;
        
        const auction = await Auction.findById(id);
        if (!auction){
            return res.status(404).json({ success: false, message: "Auction is not found!"});
        }

        const { isActive, isNotExpired, isAmount, isUserHaveCoin } = await validBid(auction, amount, userId);

        if (!isActive){
            return res.status(409).json({ success: false, message: "Event has not started yet" });
        }
        if (!isNotExpired){
            return res.status(409).json({ success: false, message: "Event has expired"});
        }
        if (!isAmount){
            return res.status(400).json({ success: false, message: "invalid amount"});
        }
        if (!isUserHaveCoin){    
            return res.status(400).json({ success: false, message: "User dont have enough coint balance"});
        }

        auction.currentPrice = amount;
        auction.currentBidder = userId;
        await auction.save();

        const bid = await Bid.create({
            auctionId: id,
            userId: userId,
            amount: amount,
            status: "active",
        });

        return res.status(201).json({ success:true, auction});
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
}