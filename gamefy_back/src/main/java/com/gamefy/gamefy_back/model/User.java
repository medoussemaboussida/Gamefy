package com.gamefy.gamefy_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gamefy.gamefy_back.model.enums.Roles;
import com.gamefy.gamefy_back.model.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Roles role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_coaching_id")
    private PackCoaching packCoaching;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_player_id")
    private PackGamefy packGamefy;

    @Column(name = "reset_pwd_token")
    private String resetPwdToken;

    @Column(name = "2fa_token")
    private String twoFaToken;

    @JsonIgnore
    @OneToOne(mappedBy = "coach", cascade = CascadeType.ALL, orphanRemoval = true)
    private CoachProfile coachProfile;

    @OneToOne(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    private Subscription subscription;

    @OneToMany(mappedBy = "coach")
    private List<CoachingSession> coachingSessions = new ArrayList<>();

    @OneToMany(mappedBy = "coach")
    private List<Reservation> coachedReservations = new ArrayList<>();

    @OneToMany(mappedBy = "player")
    private List<Reservation> playerReservations = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participations = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", status=" + status +
                ", profilePhoto='" + profilePhoto + '\'' +
                ", resetPwdToken='" + resetPwdToken + '\'' +
                ", twoFaToken='" + twoFaToken + '\'' +
                '}';
    }
}