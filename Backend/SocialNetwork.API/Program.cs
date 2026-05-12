using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Application.Mappings;
using SocialNetwork.Application.Services;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Infrastructure.Data;
using SocialNetwork.Infrastructure.Repositories;
using SocialNetwork.API.Hubs;
using SocialNetwork.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== Database Context =====
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));

builder.Services.AddDbContext<SocialNetworkDbContext>(options =>
    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.MigrationsAssembly("SocialNetwork.Infrastructure");
    }));

// ===== Repositories =====
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// ===== File Storage =====
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();

// ===== Services =====
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ILikeService, LikeService>();
builder.Services.AddScoped<ICommentService, CommentService>();

// ===== SignalR Real-time Services =====
// ConnectionManager là Singleton vì nó lưu state kết nối trong bộ nhớ
builder.Services.AddSingleton<IConnectionManager, ConnectionManager>();
// Implement interfaces từ Application layer, đặt ở API layer
builder.Services.AddScoped<IRealtimeNotificationService, HubNotificationService>();
builder.Services.AddScoped<IRealtimeChatService, HubChatService>();

// ===== AutoMapper =====
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// ===== JWT Authentication =====
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ClockSkew = TimeSpan.Zero
    };

    // ===== SignalR JWT: đọc token từ query string =====
    // WebSocket không thể gửi Authorization header, nên SignalR dùng query string
    // Frontend sẽ kết nối: /hubs/notifications?access_token=<jwt>
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs/notifications") ||
                 path.StartsWithSegments("/hubs/chat")))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ===== Controllers =====
builder.Services.AddControllers();

// ===== SignalR =====
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});

// ===== Swagger =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Social Network API",
        Version = "v1",
        Description = "Backend API for Social Network Platform"
    });

    // JWT Bearer token in Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ===== CORS =====
// QUAN TRỌNG: SignalR WebSocket yêu cầu AllowCredentials()
// AllowCredentials() KHÔNG tương thích với AllowAnyOrigin()
// Phải chỉ định rõ origin của frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",   // Vite dev server
                "http://localhost:3000",   // CRA dev server (nếu dùng)
                "https://yourdomain.com"   // Production URL (cập nhật khi deploy)
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // BẮT BUỘC cho SignalR WebSocket
    });
});

var app = builder.Build();

// ===== Middleware Pipeline =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Social Network API v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });

    // Seed database in development
    await SocialNetwork.API.Extensions.DatabaseSeeder.SeedAsync(app);
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Serve wwwroot/uploads/ cho ảnh đã upload
app.UseCors("AllowFrontend");   // Phải đặt TRƯỚC UseAuthentication và MapHub
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ===== SignalR Hubs =====
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<ChatHub>("/hubs/chat");

app.Run();

