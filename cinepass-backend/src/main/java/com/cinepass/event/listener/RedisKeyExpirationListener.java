package com.cinepass.event.listener;

import com.cinepass.service.SeatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RedisKeyExpirationListener extends KeyExpirationEventMessageListener {

    private final SeatService seatService;

    public RedisKeyExpirationListener(RedisMessageListenerContainer listenerContainer, SeatService seatService) {
        super(listenerContainer);
        this.seatService = seatService;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = message.toString();
        log.info("Redis key expired: {}", expiredKey);

        if (expiredKey.startsWith("seat_lock:")) {
            try {
                String[] parts = expiredKey.split(":");
                if (parts.length == 3) {
                    Long showId = Long.parseLong(parts[1]);
                    Long seatId = Long.parseLong(parts[2]);
                    log.info("Releasing lock for show {}, seat {} due to TTL expiration", showId, seatId);
                    seatService.releaseLock(showId, seatId);
                }
            } catch (Exception e) {
                log.error("Failed to release lock for expired key: {}", expiredKey, e);
            }
        }
    }
}
