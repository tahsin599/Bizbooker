package com.tahsin.backend.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tahsin.backend.Model.AIConversation;
import com.tahsin.backend.Model.AIMessage;
import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessHours;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.ServiceCategory;
import com.tahsin.backend.Model.SlotInterval;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.AppointmentRepository;
import com.tahsin.backend.Repository.BusinessHoursRepository;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.Repository.ServiceCategoryRepository;
import com.tahsin.backend.Repository.SlotIntervalRepository;
import com.tahsin.backend.Service.AIConversationService;
import com.tahsin.backend.Service.AIMessageService;

import org.aspectj.weaver.patterns.ConcreteCflowPointcut.Slot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gemini")
public class GeminiModelController {

    private static final Logger log = LoggerFactory.getLogger(GeminiModelController.class);

    @Value("${spring.ai.openai.api-key}")
    private String GEMINI_API_KEY;

    private final RestClient restClient;
    private final AIMessageService messageService;
    private final AIConversationService conversationService;
    private final BusinessRepository businessRepository;
    private final SlotIntervalRepository slotIntervalRepository;
    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private BusinessLocationRepository businessLocationRepository;
    @Autowired
    private BusinessHoursRepository businessHoursRepository;
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public GeminiModelController(RestClient restClient,
            AIMessageService messageService,
            AIConversationService conversationService,
            BusinessRepository businessRepository, SlotIntervalRepository slotIntervalRepository) {
        this.restClient = restClient;
        this.messageService = messageService;
        this.conversationService = conversationService;
        this.businessRepository = businessRepository;
        this.slotIntervalRepository = slotIntervalRepository;
        
    }
    public static int mapDayOfWeekToNumber(DayOfWeek dayOfWeek) {
        // Java's DayOfWeek enum starts with Monday=1, so we adjust
        return (dayOfWeek.getValue() % 7); // Sunday=0, Monday=1, ..., Saturday=6
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chatCompletion(
            @RequestParam Long conversationId,
            @RequestBody String userPrompt) {

        try {
            // Get conversation
            AIConversation conversation = conversationService.getConversationById(conversationId);
            if (conversation == null) {
                return ResponseEntity.badRequest().body("Conversation not found");
            }

            // Get last 5 messages ordered oldest first
            List<AIMessage> lastMessages = messageService.getLastNMessagesByConversationId(conversationId, 5);

            // Build conversation history
            String conversationHistory = buildConversationHistory(lastMessages);
            System.out.println(conversationHistory);

            // Enhanced instruction prompt
            String instructionPrompt = """
                    HEY AI! LISTEN CAREFULLY! THIS IS HOW YOU MUST RESPOND:

                    👶 BABY RULES:
                    1. ONLY use the EXACT formats below
                    2. NEVER add extra words or explanations
                    3. Use "na" when something is missing
                    4. For dates:
                     - If user specifies a date (like "next Sunday"), calculate the ACTUAL date in format: yyyy-MM-ddTHH:mm:ss
                    - CURRENT DATE: %s - use this as reference
                    - Never use example dates like 2023-12-25
                    EXAMPLE:
                     If today is 2025-07-23 and user says "Book next Sunday at 2pm":
                     YOU MUST calculate next Sunday is 2025-07-27 and respond:
                     "(Grand Hotel:Beachside:2:2025-07-27T14:00:00):BookingBusiness"
                    5. Remember the last 5 messages to understand!

                    🧩 RESPONSE PUZZLE PIECES:

                    A. When they ask about types of businesses:
                       "(restaurants):categoryRequest"

                    B. When creating a business:
                       - ALL info: "(downtown,Springfield,123 Main St,Bob's Burgers):BusinessCreationRequest"
                       - if user wants to know how to add or create their business on this website then reposnd with "(na:na:na:na):BusinessCreationRequest"
                       - Missing info: "(downtown:na:123 Main St:Bob's Burgers):BusinessCreationRequest"

                    C. When searching business types:
                       - With area: "(downtown:restaurant):searchCategory".'Healthcare','Beauty & Wellness','Restaurant & Food','Education','Fitness','Professional Services','Automotive','Home Services','Event Planning','Technology'. These are the categories in my system. analyze the user requirements and pick the category that fits best.
                       - Need location: "(userIdNeeded):searchCategory"

                    D. When searching business names:
                       "(Bob's Burgers):searchBusiness"

                    E. When booking:
                       - By type: "(hotels):BookingCategory"
                       - Specific business: "(Grand Hotel:Beachside:2:2023-12-25T14:00:00):BookingBusiness"
                       - Missing info: "(na:Beachside:na:2023-12-25T14:00:00):BookingBusiness"



                    G. When checking available times:
                       - Complete: "(downtown,Grand Hotel,2023-12-25T14:00:00):CheckSlot"
                       - Missing: "(downtown:na:2023-12-25T14:00:00):CheckSlot"

                    H. When checking locations:
                       "(Grand Hotel):locationCheck"
                       - Missing name: "(na):locationCheck"
                    I.if the question is about how the system works or how to use it:
                       "(na):Inquiry"

                    J. If the question is about how to book an appointment:
                          "(na):BookingInquiry"

                    I. For other questions:
                       "(na):(na)"

                    📜 HISTORY (oldest first):
                    %s

                    ❓ CURRENT QUESTION:
                    %s

                    🤖 YOUR JOB:
                    1. Look at the history to understand.check the history if the missin values are avaiable in the history relate to it with the current question and response based on that.
                    2. Pick the RIGHT puzzle piece (A-I)
                    3. Fill in the blanks with the info
                    4. ONLY respond with the EXACT format!
                    5. Use "na" for missing parts!

                    EXAMPLE:
                    If someone says "Book 2 slots at Grand Hotel Beachside on Christmas at 2pm" after talking about hotels:
                    YOU SAY: "(Grand Hotel:Beachside:2:2023-12-25T14:00:00):BookingBusiness"
                    THAT'S IT! NO EXTRA WORDS!
                    """
                    .formatted(LocalDateTime.now().toString(), conversationHistory, userPrompt);

            // Create Gemini request
            Map<String, Object> requestBody = createGeminiRequest(instructionPrompt);

            // Call Gemini API
            String response = callGeminiAPI(requestBody);

            // Process the response with conversation context
            String processedResponse = processResponse(response, conversationId);

            // Save messages
            saveConversationMessages(conversation, userPrompt, processedResponse);

            return ResponseEntity.ok(processedResponse);

        } catch (Exception e) {
            log.error("Error in chat completion: ", e);
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    private String buildConversationHistory(List<AIMessage> messages) {
        return messages.stream()
                .map(msg -> "User: " + msg.getUserMessage() + "\nAI: " + msg.getAiReply())
                .collect(Collectors.joining("\n\n"));
    }

    private Map<String, Object> createGeminiRequest(String prompt) {
        return Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "topP", 0.8,
                        "maxOutputTokens", 200));
    }

    private String callGeminiAPI(Map<String, Object> requestBody) {
        return restClient.post()
                .uri(GEMINI_API_URL + "?key=" + GEMINI_API_KEY)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);
    }

    private String processResponse(String jsonResponse, Long conversationId) {
        try {
            // Extract the raw response text
            String responseText = extractResponseText(jsonResponse);

            // Split into parameters and response type
            String[] parts = responseText.split("\\):");
            if (parts.length < 2) {
                return "(na):(na)";
            }

            String parameters = parts[0].substring(1); // Remove opening parenthesis
            String responseType = parts[1];

            // Route to appropriate handler based on response type
            return switch (responseType) {
                case "categoryRequest" -> handleCategoryRequest(parameters);
                case "BusinessCreationRequest" -> handleBusinessCreationRequest(parameters,conversationId);
                case "searchCategory" -> handleSearchCategory(parameters);
                case "searchBusiness" -> handleSearchBusiness(parameters, conversationId);
                case "BookingCategory" -> handleBookingCategory(parameters);
                case "BookingBusiness" -> handleBookingBusiness(parameters,conversationId);
                case "checkCategory" -> handleCheckCategory(parameters);
                case "CheckSlot" -> handleCheckSlot(parameters);
                case "locationCheck" -> handleLocationCheck(parameters);
                case "Inquiry" -> handleEnquiry(conversationId);
                case "BookingInquiry" -> handleBookingEnquiry();
                default -> "(na):(na)";
            };
        } catch (Exception e) {
            log.error("Error processing response", e);
            return "(na):(na)";
        }
    }

    private String handleEnquiry(Long conversationId) {
        User user=conversationService.getConversationById(conversationId).getUser();
        return "Hello "+user.getName() +"! I am Bizbooker, your personal business assistant. I can help you find businesses, book appointments, and answer your questions about our services. Just ask me anything related to businesses or bookings, and I'll do my best to assist you!";
        
    }

    private String handleBookingEnquiry() {
        return "You can go to the services option on top your dashboard where you can filter based on different services and areas also you can search for businesses in the search area. After finding a business you will be able book it from the profile of that business.Also to make your life easier,I can help you book appointments with businesses. Just tell me the business name, location, and your preferred date and time, and I'll check availability for you and I can also book for you.";
    }

    

    private String extractResponseText(String jsonResponse) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(jsonResponse);

        if (rootNode.has("candidates") && rootNode.get("candidates").isArray()
                && rootNode.get("candidates").size() > 0) {
            JsonNode candidate = rootNode.get("candidates").get(0);
            if (candidate.has("content") && candidate.get("content").has("parts")) {
                JsonNode parts = candidate.get("content").get("parts");
                if (parts.isArray() && parts.size() > 0 && parts.get(0).has("text")) {
                    return parts.get(0).get("text").asText().trim();
                }
            }
        }

        if (rootNode.has("text")) {
            return rootNode.get("text").asText().trim();
        }

        return "(na):(na)";
    }

    private String handleSearchBusiness(String businessName, Long conversationId) {
        try {
            // Search for businesses (case-insensitive contains search)
            Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
            System.out.println(businessName);

            if (business == null) {
                return "Business with this name does not exist. Please enter a valid business name and i will provide details about it.";
            } else {
                // Format found businesses
                List<BusinessLocation> locations = business.getLocations();
                String a = "The business " + business.getBusinessName() + " is located at ";
                String locationDetails = locations.stream()
                        .map(loc -> loc.getArea() + ", " + loc.getCity() + ", " + loc.getAddress())
                        .collect(Collectors.joining("; "));
                return a + locationDetails
                        + ". If you want to book an appointment with this business, please provide the date and time.";
            }
        } catch (Exception e) {
            log.error("Error searching for business: " + businessName, e);
            return "(na):searchBusiness";
        }
    }

    // Other handler methods
    private String handleCategoryRequest(String categoryName) {
        return "(" + categoryName + "):categoryRequest";
    }

    private String handleBusinessCreationRequest(String params,Long conversationId) {
       
        User user = conversationService.getConversationById(conversationId).getUser();
       return "Hey there , "+user.getName()+" ! You can add your own businesses for other customers to find and book appointments with. Go to the 'Create Business' section in your dashboard and fill out the required information. If you need help, just ask me!Then after that you can add business hours for your business and slots so that customers can book appointments with it you can do theese by going to my business section in your dashborad.Thank you";

            
    }

    private String handleSearchCategory(String params) {
        System.out.println(params);
        String[] parts = params.split(":");
        if (parts.length < 2) {
            return "please provide sufficient information to know about businesses";
        }
        String area = parts[0].equals("na") ? null : parts[0];
        String categoryName = parts[1].equals("na") ? null : parts[1];
        if (categoryName == null || categoryName.isBlank()) {
            return "please provide valid category name to know about businesses";
        }
        if (area == null || area.isBlank()) {
            return "mention the area you are interested in to know about businesses";
        }
        // Find businesses by category and area

        ServiceCategory sc = serviceCategoryRepository.findByNameIgnoreCase(categoryName).orElse(null);
        if (sc == null) {
            return "I am sorry.No businesses of the relevant category are registered in our system. Please try with another category.Thank you.";
        }

        List<Business> businesses = businessRepository
                .findByServiceCategoryIdAndLocationsArea(sc.getId(), area, Pageable.unpaged())
                .getContent();
        if (businesses.isEmpty()) {
            return "I am sorry.No businesses of the this sort are registered in this area. Please tell me if you need this service in a different area.Thank you.";
        }
        return "Here are the businesses in " + area + " that meets your requirements " + categoryName + ": "
                + businesses.stream()
                        .map(Business::getBusinessName)
                        .collect(Collectors.joining(", "))
                + ". If you want to book an appointment with any of these businesses, please provide the date and time.";
    }

    private String handleBookingCategory(String categoryName) {

        return "(" + categoryName + "):BookingCategory";
    }

    private String handleBookingBusiness(String params,Long conversationId) {
        System.out.println(params);

        String[] parts = params.split(":");
        if (parts.length < 4) {
            return "Please provide all required information: area, business name, and date/time.";
        }

        String area = parts[1].equals("na") ? null : parts[1];
        String businessName = parts[0].equals("na") ? null : parts[0];
        String slots = parts[2].equals("na") ? null : parts[2];
        String dateTimeStr = parts[3].equals("na") ? null : parts[3] + ":" + parts[4] + ":" + parts[5];
        ;

        // Validate inputs
        if (businessName == null || businessName.isBlank()) {
            return "Please provide a valid business name.";
        }
        if (dateTimeStr == null) {
            return "Please provide a valid date and time for knowing about available slots.";
        }
        if (slots == null || slots.isBlank()) {
            return "Please provide the number of slots you want to book.";
        }
        LocalDateTime desiredDateTime;
        try {
            desiredDateTime = LocalDateTime.parse(dateTimeStr);
        } catch (Exception e) {
            return "The date format is incorrect. Please use format like: 2023-12-25T14:00:00";
        }
        LocalDateTime bdDateTime = LocalDateTime.now(ZoneId.of("Asia/Dhaka"));
        if (desiredDateTime.isBefore(bdDateTime)) {
            return "No slots can be booked in the past. Please provide a realistic date and time.";
        }




        // Check if business exists
        Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
        if (business == null) {
            return "The business '" + businessName + "' doesn't exist. Please check the name and try again.";
        }
        // Check if location exists for this business
        List<BusinessLocation> locations = business.getLocations();
        if (locations == null || locations.isEmpty()) {
            return "The business '" + businessName + "' doesn't have any locations registered yet.";
        }
        // Find matching location by area (if provided)
        // Optional<BusinessLocation> matchingLocation = locations.stream()
        //         .filter(loc -> area == null ||
        //                 (loc.getArea() != null && loc.getArea().equalsIgnoreCase(area)))
        //         .findFirst();
        Optional<BusinessLocation> matchingLocation = businessLocationRepository.findOneByBusinessIdAndKeyword(business.getId(),area);
        if (!matchingLocation.isPresent()) {
            String locationMessage = area == null
                    ? "Please specify which location you're interested in. Available locations: " +
                            locations.stream()
                                    .map(loc -> loc.getArea() + " (" + loc.getAddress() + ")")
                                    .collect(Collectors.joining(", "))
                    : "No location found in area '" + area + "'. Available areas: " +
                            locations.stream()
                                    .map(BusinessLocation::getArea)
                                    .filter(a -> a != null && !a.isEmpty())
                                    .collect(Collectors.joining(", "));
            return locationMessage;
        }
        int slotsToBook;
        try {
            slotsToBook = Integer.parseInt(slots);
        } catch (NumberFormatException e) {
            return "Please provide a valid number of slots to book.";
        }
        if (slotsToBook <= 0) {
            return "Please provide a positive number of slots to book.";
        }
        BusinessLocation location = matchingLocation.get();

        DayOfWeek dayOfWeek = desiredDateTime.getDayOfWeek();
        int dayNumber = mapDayOfWeekToNumber(dayOfWeek);
        BusinessHours businessHours = businessHoursRepository
                .findByBusinessIdAndDayOfWeek(business.getId(), dayNumber)
                .orElse(null);
        if (businessHours == null) {
            return "The buisness has not configured its slots yet so it can't be booked at this time. But you can search the business name and see its details and contect them using the contact information provided in the business profile.";
        }
        if(businessHours.getIsClosed()){
            return "Sorry.The business is closed on this day. Please choose another day to book an appointment.";
        }

        // Check slot availability (using your repository method)
        int availableSlots = slotIntervalRepository.getAvailableSlotsCount(
                location.getId(),
                desiredDateTime);
        if (availableSlots < slotsToBook) {
            return "Sorry, there are only " + availableSlots + " available slot(s) at " + location.getArea() +
                    " for " + desiredDateTime.toLocalDate() + " at " +
                    desiredDateTime.toLocalTime() + ". Would you like to book fewer slots?";
        } else {
            // Here you would typically create a booking in your system
            // For now, just return a success message
            Appointment appointment = new Appointment();
            appointment.setBusiness(business);
            appointment.setLocation(location);
            SlotInterval slotInterval = slotIntervalRepository
                    .findSlotIntervalAtDateTime(location.getId(), desiredDateTime)
                    .orElse(null);
            if (slotInterval == null) {
                return "No slot interval found for the specified date and time. Please try again.";
            }
            LocalDate desiredDate = desiredDateTime.toLocalDate();

            // Get the start time from your slot interval
            LocalTime startTime = slotInterval.getStartTime(); // e.g., 09:00:00

            // Combine them to create a new LocalDateTime
            LocalDateTime startDateTime = LocalDateTime.of(desiredDate, startTime);
            appointment.setStartTime(startDateTime);
            LocalDateTime endDateTime = LocalDateTime.of(desiredDate, slotInterval.getEndTime());
            appointment.setEndTime(endDateTime);
            slotInterval.setUsedSlots(slotInterval.getUsedSlots() + slotsToBook);
            System.out.println(slotInterval.getConfiguration().getId() );
            slotIntervalRepository.save(slotInterval);
            appointment.setCustomer(conversationService.getConversationById(conversationId).getUser());
            
            appointmentRepository.save(appointment);
            return "Successfully booked " + slotsToBook + " slot(s) at ";
        }

    }

    private String handleCheckCategory(String businessName) {
        return "(" + businessName + "):checkCategory";
    }

    private String handleCheckSlot(String params) {
        try {
            // Parse parameters (format: "downtown,Grand Hotel,2023-12-25T14:00:00")
            String[] parts = params.split(",");
            if (parts.length < 3) {
                return "Please provide all required information: area, business name, and date/time.";
            }

            String area = parts[0].equals("na") ? null : parts[0];
            String businessName = parts[1].equals("na") ? null : parts[1];
            String dateTimeStr = parts[2].equals("na") ? null : parts[2];

            // Validate inputs
            if (businessName == null || businessName.isBlank()) {
                return "Please provide a valid business name.";
            }
            if (dateTimeStr == null) {
                return "Please provide a valid date and time for knowing about available slots.";
            }

            LocalDateTime desiredDateTime;
            try {
                desiredDateTime = LocalDateTime.parse(dateTimeStr);
            } catch (Exception e) {
                return "The date format is incorrect. Please use format like: 2023-12-25T14:00:00";
            }

            // Check if business exists
            Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
            if (business == null) {
                return "The business '" + businessName + "' doesn't exist. Please check the name and try again.";
            }

            // Check if location exists for this business
            List<BusinessLocation> locations = business.getLocations();
            if (locations == null || locations.isEmpty()) {
                return "The business '" + businessName + "' doesn't have any locations registered yet.";
            }

            // Find matching location by area (if provided)
            // Optional<BusinessLocation> matchingLocation = locations.stream()
            //         .filter(loc -> area == null ||
            //                 (loc.getArea() != null && loc.getArea().equalsIgnoreCase(area)))
            //         .findFirst();
            Optional<BusinessLocation> matchingLocation = businessLocationRepository.findOneByBusinessIdAndKeyword(business.getId(),area);
            if (!matchingLocation.isPresent()) {
                String locationMessage = area == null
                        ? "Please specify which location you're interested in. Available locations: " +
                                locations.stream()
                                        .map(loc -> loc.getArea() + " (" + loc.getAddress() + ")")
                                        .collect(Collectors.joining(", "))
                        : "No location found in area '" + area + "'. Available areas: " +
                                locations.stream()
                                        .map(BusinessLocation::getArea)
                                        .filter(a -> a != null && !a.isEmpty())
                                        .collect(Collectors.joining(", "));
                return locationMessage;
            }

            BusinessLocation location = matchingLocation.get();

            // Check slot availability (using your repository method)
            int availableSlots = slotIntervalRepository.getAvailableSlotsCount(
                    location.getId(),
                    desiredDateTime);
            int dayOfWeek = desiredDateTime.toLocalDate().getDayOfWeek().getValue();
            if (availableSlots <= 0) {
                return "Sorry, there are no available slots at " + location.getArea() +
                        " for " + desiredDateTime.toLocalDate() + " at " +
                        desiredDateTime.toLocalTime() + ". Would you like to try a different time?";
            } else {
                return "There are " + availableSlots + " available slot(s) at " +
                        location.getArea() + " for " + desiredDateTime.toLocalDate() +
                        " at " + desiredDateTime.toLocalTime() + ". Would you like to book one? " +
                        "Just say 'Book X slots at business named " + businessName + " location " + location.getArea() +
                        " on " + desiredDateTime.toLocalDate() + " at " +
                        desiredDateTime.toLocalTime() + "'";
            }

        } catch (Exception e) {
            log.error("Error checking slots", e);
            return "Sorry, I encountered an error checking availability. Please try again later.";
        }
    }

    private String handleLocationCheck(String businessName) {
        Business business = businessRepository.findByBusinessNameIgnoreCase(businessName);
        if (business == null) {
            return "Sorry,There is no business with this name registered in our system. Please tell me if you need more help.";
        }
        List<BusinessLocation> locations = business.getLocations();
        if (locations == null || locations.isEmpty()) {
            return "The business '" + business.getBusinessName() + "' doesn't have any locations registered yet.";

        }
        String locationDetails = locations.stream()
                .map(loc -> loc.getArea() + ", " + loc.getCity() + ", " + loc.getAddress())
                .collect(Collectors.joining("; "));
        return "The business " + business.getBusinessName() + " is located at " + locationDetails
                + ". If you want to book an appointment with this business, please provide the date and time.";
        
    }

    private void saveConversationMessages(AIConversation conversation,
            String userPrompt,
            String aiResponse) {
        try {
            // Save user message
            AIMessage userMessage = new AIMessage();
            userMessage.setConversation(conversation);
            userMessage.setUserMessage(userPrompt);
            userMessage.setAiReply(aiResponse);
            userMessage.setCreatedAt(LocalDateTime.now());
            messageService.saveMessage(userMessage);

            // Update conversation last activity
            conversation.setLastActivity(LocalDateTime.now());
            conversationService.updateConversation(conversation);
        } catch (Exception e) {
            log.error("Error saving conversation messages", e);
        }
    }
}