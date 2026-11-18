import { dataService } from '../services/dataService.js';

export const createEnquiry = async (req, res) => {
  try {
    const {
      customerName,
      whatsappNumber,
      email,
      city,
      address,
      productId,
      productDetails,
      cartItems,
      quantity,
      totalAmount,
      customerMessage
    } = req.body;

    if (!customerName || !whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and WhatsApp number are required.'
      });
    }

    const enquiry = await dataService.createEnquiry({
      customerName,
      whatsappNumber,
      email: email || '',
      city: city || '',
      address: address || '',
      product: productId || null,
      productDetails: productDetails || null,
      cartItems: cartItems || [],
      quantity: Number(quantity) || 1,
      totalAmount: Number(totalAmount) || 0,
      customerMessage: customerMessage || '',
      orderStatus: 'New',
      adminNotes: ''
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry received successfully! Our team will connect with you on WhatsApp shortly.',
      enquiry
    });
  } catch (error) {
    console.error('Enquiry creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit enquiry' });
  }
};

export const getEnquiries = async (req, res) => {
  try {
    const { status, search, limit } = req.query;
    const enquiries = await dataService.getEnquiries({
      status,
      search,
      limit: Number(limit) || 100
    });

    res.json({
      success: true,
      enquiries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries' });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const { orderStatus, adminNotes } = req.body;
    const updated = await dataService.updateEnquiryStatus(req.params.id, {
      orderStatus,
      adminNotes
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      enquiry: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update enquiry' });
  }
};

