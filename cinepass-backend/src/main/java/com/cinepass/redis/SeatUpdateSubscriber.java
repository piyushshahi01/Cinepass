package com.cinepass.redis;

import com.cinepass.dto.SeatUpdateMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatUpdateSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // Since GenericJackson2JsonRedisSerializer was used, we need to extract the actual object
            // The safest way is to use Jackson to read the tree, and if it's an array, get the second element
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(message.getBody());
            SeatUpdateMessage seatUpdate;
            if (root.isArray() && root.size() == 2) {
                seatUpdate = objectMapper.treeToValue(root.get(1), SeatUpdateMessage.class);
            } else {
                seatUpdate = objectMapper.treeToValue(root, SeatUpdateMessage.class);
            }
            
            String destination = "/topic/show/" + seatUpdate.getShowId();
            log.info("Received from Redis Pub/Sub, broadcasting to {}", destination);
            messagingTemplate.convertAndSend(destination, seatUpdate);
        } catch (Exception e) {
            log.error("Failed to process Redis Pub/Sub message", e);
        }
    }
}
